import { Model } from "mongoose";
import { orderModel } from "./model/order.schema";

class OrderRepository {
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
                    path: "userCoupon",
                    model: "coupon", // 실제 모델명과 일치
                    select: "-__v", // 필요없는 필드 제외
                },
            ])
            .select("-__v");
    }

    async save(order: Model<any>) {
        return orderModel.create(order);
    }
}

const orderRepository: OrderRepository = new OrderRepository();
export default orderRepository;
