import { Request, ParamsDictionary, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { OrderReqDto, OrderUpdateDto } from "./dto/order.req.dto";
import productRepository from "../../router/product/repository/product.repository";
import { orderModel } from "./model/order.schema";
import mongoose, { Types } from "mongoose";
import orderRepository from "./order.repository";
import userRepository from "../../router/user/repository/user.repository";
import { userModel } from "../../router/user/model/user.scheme";
import { userInventoryModel } from "../../router/user/model/userInventory.schema";

class OrderService {
    async updateOrder(
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
        res: Response<any, Record<string, any>, number>
    ) {
        const loginId: string = req.headers["X-Request-user-id"] as string;

        const user: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const body: OrderUpdateDto = req.body;
        const orderId = req.params.orderId;

        const order: any = await orderRepository.findById(orderId);

        if (!order) {
            return res.status(404).send({
                message: "주문서가 존재하지 않습니다.",
                code: "E203",
            });
        } else if (order.paymentStatus === "paid") {
            return res.status(400).send({
                message: "이미 결제가 완료된 주문서입니다.",
                code: "E204",
            });
        } else if (order.userInfo["user"].loginId !== loginId) {
            return res.status(403).send({
                message: "본인의 주문서가 아닙니다.",
                code: "E205",
            });
        }

        const userInventory: any = await userModel.populate(user, {
            path: "inventory",
        });

        if (body.paymentMethod) {
            order.paymentMethod = body.paymentMethod;
        }

        if (body.usePoint) {
            const availablePoints: number = userInventory.inventory.points;

            if (!availablePoints || availablePoints < body.usePoint) {
                return res.status(400).send({
                    message: "사용 가능한 포인트가 부족합니다.",
                    code: "E206",
                });
            }
            order.usedPoints = body.usePoint;
        }

        if (body.couponId) {
            const coupons: Array<any> = await userInventoryModel.populate(
                userInventory,
                {
                    path: "coupons",
                }
            );

            // 쿠폰이 존재하는지 확인
            if (
                !coupons.find(
                    (coupon: any) => coupon._id.toString() === body.couponId
                )
            ) {
                return res.status(400).send({
                    message: "사용 가능한 쿠폰이 존재하지 않습니다.",
                    code: "E207",
                });
            }
        }

        if (body.userAddressId) {
            const addresses: Array<any> = user.addresses;
            // 주소가 존재하는지 확인
            if (
                !addresses.find((address: Types.ObjectId) =>
                    address._id.equals(body.userAddressId)
                )
            ) {
                return res.status(400).send({
                    message: "사용 가능한 주소가 존재하지 않습니다.",
                    code: "E208",
                });
            }
            order.addressInfo.userAddress = body.userAddressId;
        }

        const saved: any = await orderRepository.save(order);
        const orderData: any = orderModel.populate(saved, [
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
        return res.status(200).json({
            message: "order update success",
            order: await orderData,
        });
    }
    /**
     * 상품 목록을 받아서 주문 Id를 생성
     * @param req
     * @param res
     */
    async createOrder(
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
        res: Response<any, Record<string, any>, number>
    ) {
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
            return res.status(400).send({
                message:
                    "주문서 생성 요청에 필요한 상품 목록 중 상품이 존재하지 않습니다.",
                code: "E201",
            });
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
                return res.status(400).send({
                    message:
                        "주문서 생성 요청에 필요한 상품 목록 중 상품의 옵션이 존재하지 않습니다.",
                    code: "E202",
                });
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
            products: body.products.map((product) => {
                return {
                    productId: new mongoose.Types.ObjectId(product.productId),
                    amount: product.amount,
                    optionName: product.optionName,
                };
            }),
            userInfo: { user: populatedUser._id },
            paymentStatus: "unpaid",
            paymentMethod: "none",
            addressInfo: {
                userAddress: userAddresses[0]._id,
            },

            totalPrice: body.products.reduce((acc: number, cur) => {
                const product: any = products.find(
                    (product) => product._id.toString() === cur.productId
                );

                if (cur.optionName) {
                    const option = product.options.find(
                        (option: any) => option.optName === cur.optionName
                    );

                    return (
                        acc +
                        option.optOrgPrice * cur.amount +
                        option.additionalPrice
                    );
                }

                return acc + product.finalPrice * cur.amount;
            }, 0),
        });

        const saved: any = await orderRepository.save(order);

        const orderData: any = orderModel.populate(saved, [
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

        return res.status(200).json({
            message: "order create success",
            order: await orderData,
        });
    }
}

export default OrderService;
