import { Request, ParamsDictionary, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { OrderReqDto } from "./dto/order.req.dto";
import productRepository from "../../router/product/repository/product.repository";
import { orderModel } from "./model/order.schema";
import mongoose from "mongoose";
import orderRepository from "./order.repository";
import userRepository from "../../router/user/repository/user.repository";
import { userModel } from "../../router/user/model/user.scheme";

class OrderService {
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

        console.log("productIds:", productIds);
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

            console.log("product:", product);
            console.log("orderProduct:", orderProduct);

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

        console.log("\npopulatedUser:", populatedUser);

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

        return res.status(200).json({
            message: "order create success",
            order: saved,
        });
    }
}

export default OrderService;
