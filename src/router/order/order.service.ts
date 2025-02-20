import { Request, Response } from "express-serve-static-core";
import { OrderProduct, OrderReqDto, OrderUpdateDto } from "./dto/order.req.dto";
import productRepository from "../../router/product/repository/product.repository";
import { orderModel } from "./model/order.schema";
import mongoose, { Types } from "mongoose";
import orderRepository from "./repository/order.repository";
import userRepository from "../../router/user/repository/user.repository";
import { userModel } from "../user/model/user.schema";
import userInventoryRepository from "../../router/user/repository/userInventory.repository";
import orderIdemKeyRepository from "./repository/orderIdemKey.repository";
import { orderIdemKeyModel } from "./model/orderIdemKey.schema";
import { ResDto } from "../../common/dto/common.res.dto";
import { validateRequest } from "../../common/decorators/validate.decorator";
import { ErrorDto } from "../../common/dto/error.res.dto";
import { ERRCODE } from "../../common/constants/errorCode.constants";

class OrderService {
    async getOrderDetail(req: Request, res: Response): Promise<ResDto> {
        const loginId: string = req.headers["X-Request-user-id"] as string;

        const orderId = req.params.orderId;

        const order: any = await orderRepository.findById(orderId);

        if (!order) {
            return new ErrorDto(ERRCODE.E203);
        } else if (order.userInfo["user"].loginId !== loginId) {
            return new ErrorDto(ERRCODE.E205);
        }

        const orderObj = order.toObject();
        orderObj.orderId = orderObj._id;
        delete orderObj._id;

        const nonIcedProducts = order.products.filter(
            (product: any) => !product.deliveryInfo.isIce
        );
        const icedProducts = order.products.filter(
            (product: any) => product.deliveryInfo.isIce
        );

        // 일반 상품 배송 상태 결정
        const nonIcedDeliveryStatuses = nonIcedProducts.map(
            (product: any) => product.deliveryInfo.deliveryStatus
        );
        let nonIcedProdDelivStatus = "ready";
        if (nonIcedDeliveryStatuses.length > 0) {
            if (
                nonIcedDeliveryStatuses.every(
                    (status: string) => status === "delivered"
                )
            ) {
                nonIcedProdDelivStatus = "delivered";
            } else if (
                nonIcedDeliveryStatuses.some(
                    (status: string) => status === "shipping"
                )
            ) {
                nonIcedProdDelivStatus = "shipping";
            }
        }

        // 아이스 상품 배송 상태 결정
        const icedDeliveryStatuses = icedProducts.map(
            (product: any) => product.deliveryInfo.deliveryStatus
        );
        let icedProdDelivStatus = "ready";
        if (icedDeliveryStatuses.length > 0) {
            if (
                icedDeliveryStatuses.every(
                    (status: string) => status === "delivered"
                )
            ) {
                icedProdDelivStatus = "delivered";
            } else if (
                icedDeliveryStatuses.some(
                    (status: string) => status === "shipping"
                )
            ) {
                icedProdDelivStatus = "shipping";
            }
        }

        const data = {
            order: {
                ...orderObj,
                deliveryStatus: {
                    icedProdDelivStatus,
                    nonIcedProdDelivStatus,
                },
                totalPrice: orderObj.totalPrice - orderObj.usedPoints,
                totalOrgPrice: orderObj.products.reduce(
                    (acc: number, cur: any) => {
                        return acc + cur.productId.orgPrice * cur.amount;
                    },
                    0
                ),
                totalDiscountedPrice:
                    orderObj.products.reduce((acc: number, cur: any) => {
                        return acc + cur.productId.orgPrice * cur.amount;
                    }, 0) -
                    orderObj.totalPrice +
                    orderObj.usedPoints,
            },
        };
        return new ResDto({ data: data });
    }

    @validateRequest
    async approveOrder(req: Request, res: Response): Promise<ResDto> {
        const loginId: string = req.headers["X-Request-user-id"] as string;

        const uuid: string = req.body.uuid;
        const orderId = req.params.orderId;

        // 중복 요청 방지를 위한 uuid 체크
        const orderIdemKey: any =
            await orderIdemKeyRepository.findByIdAndUuidAndOrderId(
                uuid,
                orderId
            );
        if (orderIdemKey) {
            const idemKeyOrder: any = await orderIdemKeyModel.populate(
                orderIdemKey,
                {
                    path: "orderId",
                }
            );
            const order: any = idemKeyOrder.orderId;
            const addedPoints: number = order.totalPrice * 0.01; // 1% 적립 (적립 예시 퍼센트)

            return new ResDto({
                message: "order approve success",
                data: {
                    totalPaidPrice: order.totalPrice - order.usedPoints,
                    addedPoints,
                    orderId: order._id,
                },
            });
        }

        const user: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const order: any = await orderRepository.findById(orderId);

        if (!order) {
            return new ErrorDto(ERRCODE.E203);
        } else if (order.userInfo["user"].loginId !== loginId) {
            return new ErrorDto(ERRCODE.E205);
        }
        if (order.paymentStatus === "paid") {
            return new ErrorDto(ERRCODE.E204);
        }
        if (order.paymentMethod === "none") {
            return new ErrorDto(ERRCODE.E206);
        }
        if (!order.addressInfo?.userAddress) {
            return new ErrorDto(ERRCODE.E208);
        }

        order.paymentStatus = "paid";

        order.approveAt = new Date();
        const orderProducts: Array<any> = order.products;
        orderProducts.forEach((product) => {
            product["deliveryInfo"] = {
                deliveryStatus: "ready",
                deliveryComp: product.productId.info.deliveryComp,
            };
        });

        const userInventory: any = await userModel.populate(user, {
            path: "inventory",
        });

        const addedPoints: number = order.totalPrice * 0.01; // 1% 적립 (적립 예시 퍼센트)

        if (order.usedPoints) {
            userInventory.inventory.points =
                userInventory.inventory.points - order.usedPoints + addedPoints;
        }
        const saved: any = await orderRepository.save(order);
        await userInventoryRepository.update(userInventory.inventory);

        // 중복 요청 방지를 위한 uuid 저장
        await orderIdemKeyRepository.save({
            uuid,
            orderId,
        });

        return new ResDto({
            message: "order approve success",
            data: {
                totalPaidPrice: saved.totalPrice - saved.usedPoints,
                addedPoints,
                orderId: saved._id,
            },
        });
    }

    @validateRequest
    async updateOrder(req: Request, res: Response): Promise<ResDto> {
        const loginId: string = req.headers["X-Request-user-id"] as string;

        const user: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const body: OrderUpdateDto = req.body;
        const orderId = req.params.orderId;

        const order: any = await orderRepository.findById(orderId);

        if (!order) {
            return new ErrorDto(ERRCODE.E203);
        } else if (order.paymentStatus === "paid") {
            return new ErrorDto(ERRCODE.E204);
        } else if (order.userInfo["user"].loginId !== loginId) {
            return new ErrorDto(ERRCODE.E205);
        }

        const userInventory: any = await userModel.populate(user, {
            path: "inventory",
        });

        if (body.paymentMethod) {
            order.paymentMethod = body.paymentMethod.toLowerCase();
        }

        if (body.usePoint) {
            const availablePoints: number = userInventory.inventory.points;

            if (!availablePoints || availablePoints < body.usePoint) {
                return new ErrorDto(ERRCODE.E206);
            }
            order.usedPoints = body.usePoint;
        }

        // if (body.couponId) {
        //     const coupons: Array<any> = await userInventoryModel.populate(
        //         userInventory,
        //         {
        //             path: "coupons",
        //         }
        //     );

        //     // 쿠폰이 존재하는지 확인
        //     if (
        //         !coupons.find(
        //             (coupon: any) => coupon._id.toString() === body.couponId
        //         )
        //     ) {
        //         return res.status(400).send({
        //             message: "사용 가능한 쿠폰이 존재하지 않습니다.",
        //             code: "E207",
        //         });
        //     }
        // }

        if (body.userAddressId) {
            const addresses: Array<any> = user.addresses;
            // 주소가 존재하는지 확인
            if (
                !addresses.find((address: Types.ObjectId) =>
                    address._id.equals(body.userAddressId)
                )
            ) {
                return new ErrorDto(ERRCODE.E208);
            }
            order.addressInfo.userAddress = body.userAddressId;
        }

        const saved: any = await orderRepository.save(order);
        const orderData: any = await orderModel.populate(saved, [
            {
                path: "userInfo.user",
                model: "user", // 실제 모델명과 일치
                select: "name phone email",
            },
            {
                path: "addressInfo.userAddress",
                model: "userAddress", // 실제 모델명과 일치
                select: "-__v",
            },
            {
                path: "userCoupon",
                model: "coupon", // 실제 모델명과 일치
                select: "-__v",
            },
        ]);

        const orderDataObj = orderData.toObject();
        orderDataObj.orderId = orderDataObj._id;
        delete orderDataObj._id;

        return new ResDto({
            message: "order update success",
            data: { order: orderDataObj },
        });
    }
    /**
     * 상품 목록을 받아서 주문 Id를 생성
     * @param req
     * @param res
     */
    async createOrder(req: Request, res: Response): Promise<ResDto> {
        const loginId: string = req.headers["X-Request-user-id"] as string;

        const user: any = userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const body: OrderReqDto = req.body;

        // 상품이 실제로 존재하는지 확인
        const productIds: Array<string> = body.products.map(
            (product) => product.productId
        );

        const products: Array<any> =
            await productRepository.findProductByIdsForOrder(productIds);

        if (products.length !== body.products.length) {
            return new ErrorDto(ERRCODE.E201);
        }

        for (const orderProduct of body.products) {
            if (!orderProduct.optionName) {
                continue;
            }
            const product: any = products.find(
                (product) => product._id.toString() === orderProduct.productId
            );

            if (
                !product.options.find(
                    (option: any) =>
                        option.optName.toString() === orderProduct.optionName
                )
            ) {
                return new ErrorDto(ERRCODE.E202);
            }
        }

        const populatedUser: any = await userModel.populate(await user, {
            path: "addresses",
            match: {
                defaultAddr: true,
            },
        });
        const userAddresses: Array<any> = populatedUser.addresses;

        const order = new orderModel({
            products: body.products.map((product: OrderProduct) => {
                const productEntity: any = products.find(
                    (entity) => entity._id.toString() === product.productId
                );

                // 옵션이 있는 경우의 가격 계산
                let orgPrice, finalPrice;

                if (product.optionName) {
                    const option = productEntity?.options.find(
                        (opt: any) => opt.optName === product.optionName
                    );

                    // orgPrice 계산
                    orgPrice =
                        option?.optOrgPrice && option?.optOrgPrice !== 0
                            ? option.optOrgPrice
                            : productEntity?.orgPrice;

                    // finalPrice 계산 - orgPrice에 추가 가격 더하기
                    finalPrice = orgPrice + (option?.additionalPrice || 0);
                } else {
                    // 옵션이 없는 경우
                    orgPrice = productEntity?.orgPrice;
                    finalPrice = productEntity?.finalPrice;
                }

                return {
                    productId: new mongoose.Types.ObjectId(product.productId),
                    amount: product.amount,
                    optionName: product.optionName,
                    orgPrice,
                    finalPrice,
                };
            }),
            userInfo: { user: populatedUser._id },
            paymentStatus: "unpaid",
            paymentMethod: "none",
            addressInfo: {
                userAddress: userAddresses[0]?._id,
            },

            totalPrice: body.products.reduce((acc: number, cur) => {
                const productEntity: any = products.find(
                    (product) => product._id.toString() === cur.productId
                );

                let price;
                if (cur.optionName) {
                    const option = productEntity.options.find(
                        (opt: any) => opt.optName === cur.optionName
                    );

                    // orgPrice 계산과 동일한 로직 적용
                    const basePrice =
                        option?.optOrgPrice && option?.optOrgPrice !== 0
                            ? option.optOrgPrice
                            : productEntity?.orgPrice;

                    // finalPrice 계산과 동일한 로직 적용
                    price = basePrice + (option?.additionalPrice || 0);
                } else {
                    price = productEntity?.finalPrice;
                }

                return acc + price * cur.amount;
            }, 0),
        });

        const saved: any = await orderRepository.save(order);

        const orderData: any = await orderModel.populate(saved, [
            {
                path: "userInfo.user",
                model: "user", // 실제 모델명과 일치
                select: "name phone email",
            },
            {
                path: "addressInfo.userAddress",
                model: "userAddress", // 실제 모델명과 일치
                select: "-__v",
            },
        ]);

        const orderDataObj = orderData.toObject();
        orderDataObj.orderId = orderDataObj._id;
        delete orderDataObj._id;

        return new ResDto({
            message: "order create success",
            data: { order: orderDataObj },
        });
    }
}

export default OrderService;
