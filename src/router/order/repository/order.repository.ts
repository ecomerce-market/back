import { Model } from "mongoose";
import { orderModel } from "../model/order.schema";

class OrderRepository {
    async countByUserId(userId: any) {
        return orderModel.countDocuments({
            "userInfo.user": userId,
            approveAt: {
                $ne: null,
                $gt: new Date(
                    new Date().setFullYear(new Date().getFullYear() - 3) // 3년 전부터
                ),
            },
        });
    }
    async findByUserId(
        userId: string,
        pageSize: number,
        pageNumber: number
    ): Promise<any> {
        return orderModel
            .find()
            .where({
                "userInfo.user": userId,
                approveAt: {
                    $ne: null,
                    $gt: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 3)
                    ), // 3년 전부터
                },
            })
            .populate([
                {
                    path: "products.productId",
                    model: "product",
                },
            ])
            .sort({ approveAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1));
    }

    async findById(orderId: string): Promise<any> {
        return orderModel
            .findById(orderId)
            .populate([
                {
                    path: "userInfo.user",
                    select: "loginId", // 필요한 필드만
                },
                {
                    path: "addressInfo.userAddress",
                    model: "userAddress", // 실제 모델명과 일치
                    select: "-__v", // 필요없는 필드 제외
                },
                {
                    path: "products.productId",
                    model: "product",
                },

                // {
                //     path: "userCoupon",
                //     model: "coupon", // 실제 모델명과 일치
                //     select: "-__v", // 필요없는 필드 제외
                // },
            ])
            .select("-__v");
    }

    async save(order: Model<any>) {
        return orderModel.create(order);
    }
}

const orderRepository: OrderRepository = new OrderRepository();
export default orderRepository;
