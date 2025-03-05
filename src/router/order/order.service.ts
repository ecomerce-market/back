import { Request, Response } from "express-serve-static-core";
import {
    OrderProductItem,
    OrderReqDto,
    OrderUpdateDto,
} from "./dto/order.req.dto";
import productRepository from "../../router/product/repository/product.repository";
import { Order, orderModel, OrderProduct } from "./model/order.schema";
import mongoose, { Document, Types } from "mongoose";
import orderRepository from "./repository/order.repository";
import userRepository from "../../router/user/repository/user.repository";
import { User, userModel } from "../user/model/user.schema";
import userInventoryRepository from "../../router/user/repository/userInventory.repository";
import orderIdemKeyRepository from "./repository/orderIdemKey.repository";
import { orderIdemKeyModel } from "./model/orderIdemKey.schema";
import { ResDto } from "../../common/dto/common.res.dto";
import { validateRequest } from "../../common/decorators/validate.decorator";
import { ErrorDto } from "../../common/dto/error.res.dto";
import { ERRCODE } from "../../common/constants/errorCode.constants";
import { Product } from "../../router/product/model/product.schema";
import { userInventoryModel } from "../../router/user/model/userInventory.schema";

class OrderService {
    async getOrderDetail(req: Request, res: Response): Promise<ResDto> {
        const loginId: string = req.headers["X-Request-user-id"] as string;

        const orderId = req.params.orderId;

        const orderEntity: Document = await orderRepository.findById(
            orderId,
            true
        ); // mongoose model
        const order: Order & { orderId?: string } = orderEntity.toObject(); // 불필요한 컬럼을 제외 한 도큐먼트 데이터

        if (!order) {
            return new ErrorDto(ERRCODE.E203);
        } else if (
            typeof order.userInfo["user"] !== "string" &&
            order.userInfo["user"].loginId !== loginId
        ) {
            return new ErrorDto(ERRCODE.E205);
        }
        order.orderId = order._id;

        if (typeof order.products !== "object") {
            return new ErrorDto(ERRCODE.E999);
        }
        const nonIcedProducts: Array<any> = order.products.filter(
            (product: OrderProduct) =>
                !(product.productId as Product).info.isIce
        );
        const icedProducts: Array<any> = order.products.filter(
            (product: OrderProduct) => (product.productId as Product).info.isIce
        );

        // 일반 상품 배송 상태 결정
        const nonIcedDeliveryStatuses = nonIcedProducts.map(
            (product: OrderProduct) => product.deliveryInfo.deliveryStatus
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

        let totalOrgPrice = 0;
        let totalDiscountedPrice = 0;
        let totalDeliveryFee = 0;
        let couponDiscount = 0;
        let totalPrice = 0;

        order.products.forEach((product: OrderProduct) => {
            if (typeof product.productId === "object") {
                totalOrgPrice += product.productId.orgPrice * product.amount;
                totalDiscountedPrice +=
                    product.productId.orgPrice * product.amount -
                    product.finalPrice * product.amount;
                totalPrice += product.finalPrice * product.amount;
                totalDeliveryFee += product.productId.info.deliveryFee;
            }
        });

        totalPrice += totalDeliveryFee;

        if (order.userCoupon && typeof order.userCoupon === "object") {
            const discountPer = order.userCoupon.discountPer;
            const discountWon = order.userCoupon.discountWon;

            if (discountPer) {
                couponDiscount = totalPrice * (discountPer / 100);
            }

            if (discountWon) {
                couponDiscount = discountWon;
            }
            totalPrice -= couponDiscount;
        }

        // order 객체에서 _id 제거
        const orderObj: any = Object.assign({}, order);
        delete orderObj._id;

        const data = {
            order: {
                ...orderObj,
                deliveryStatus: {
                    icedProdDelivStatus,
                    nonIcedProdDelivStatus,
                },
                totalOrgPrice,
                totalDiscountedPrice,
                totalDeliveryFee,
                couponDiscount,
                usedPoints: orderObj.usedPoints,
                totalPrice,
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
            const orderEntity: any = idemKeyOrder.orderId;
            const order: Order = orderEntity.toObject();
            const addedPoints: number = order.totalPrice * 0.01; // 1% 적립 (적립 예시 퍼센트)

            return new ResDto({
                message: "order approve success",
                data: {
                    totalPaidPrice: order.totalPrice - (order.usedPoints ?? 0),
                    addedPoints,
                    orderId: order._id,
                },
            });
        }

        const userEntity: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const user: User = userEntity.toObject();

        const orderEntity: any = await orderRepository.findById(orderId, true);
        const order: Order = orderEntity.toObject();

        if (!order) {
            return new ErrorDto(ERRCODE.E203);
        } else if ((order.userInfo["user"] as User).loginId !== loginId) {
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
        orderProducts.forEach((product: any) => {
            product["deliveryInfo"] = {
                deliveryStatus: "ready",
                deliveryComp: product.productId.info.deliveryComp,
            };
        });
        const userInventory: any = await userModel.populate(user, [
            {
                path: "inventory",
            },
        ]);
        const addedPoints: number = order.totalPrice * 0.01; // 1% 적립 (적립 예시 퍼센트)

        if (order.usedPoints) {
            userInventory.inventory.points =
                userInventory.inventory.points - order.usedPoints + addedPoints;
        }

        if (order.userCoupon) {
            (userInventory.inventory.coupons as Array<any>).forEach(
                (coupon: any) => {
                    if (
                        coupon.coupon.toString() ===
                        order.userCoupon?.toString()
                    ) {
                        coupon.useAt = new Date();
                    }
                }
            );
        }

        await orderRepository.update(order);
        await userInventoryRepository.update(userInventory.inventory);

        // 중복 요청 방지를 위한 uuid 저장
        await orderIdemKeyRepository.save({
            uuid,
            orderId,
        });

        const data = {
            totalPaidPrice: order.totalPrice - (order.usedPoints ?? 0),
            addedPoints,
            orderId: order._id,
        };

        return new ResDto({
            message: "order approve success",
            data,
        });
    }

    @validateRequest
    async updateOrder(req: Request, res: Response): Promise<ResDto> {
        const loginId: string = req.headers["X-Request-user-id"] as string;

        const user: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const body: OrderUpdateDto = req.body;
        const orderId = req.params.orderId;

        const orderEntity: any = await orderRepository.findById(orderId, true);
        const order: Order = orderEntity.toObject();

        if (!order) {
            return new ErrorDto(ERRCODE.E203);
        } else if (order.paymentStatus === "paid") {
            return new ErrorDto(ERRCODE.E204);
        } else if ((order.userInfo["user"] as User).loginId !== loginId) {
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

        if (body.couponId) {
            const inventoryWithCoupon: any = await userInventoryModel.populate(
                userInventory,
                {
                    path: "inventory.coupons",
                    model: "coupon",
                }
            );

            console.log("inventoryWithCoupon: ", inventoryWithCoupon);
            const coupons: Array<any> = inventoryWithCoupon.inventory.coupons;

            console.log("coupons: ", coupons);
            // 쿠폰이 존재하는지 확인
            if (
                !coupons.find(
                    (coupon: any) =>
                        coupon.coupon.toString() === body.couponId &&
                        coupon.useAt === null
                )
            ) {
                return new ErrorDto(ERRCODE.E209);
            }

            order.userCoupon = body.couponId;
        }
        if (body.couponId === null) {
            order.userCoupon = null;
        }

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

        await orderRepository.update(order);
        const orderData: any = await orderModel.populate(order, [
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

        const orderDataObj: any = Object.assign({}, orderData);
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

        const userEntity: Document =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const user: User = userEntity.toObject();

        const body: OrderReqDto = req.body;

        // 상품이 실제로 존재하는지 확인
        const productIds: Array<string> = body.products.map(
            (product) => product.productId
        );

        const products: Array<any> =
            await productRepository.findProductByIdsForOrder(productIds);

        // 상품의 갯수와 요청의 갯수 대신 products에 있는 상품이 body.products에 모두 존재하는지 ?
        if (
            !body.products.every((product) =>
                products.find((p) => p._id.toString() === product.productId)
            )
        ) {
            // if (products.length !== body.products.length) {
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
            products: body.products.map((product: OrderProductItem) => {
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

        const orderData: Document = await orderModel.populate(order, [
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
