import { Model } from "mongoose";
import { orderModel } from "./model/order.schema";

class OrderRepository {
    async save(order: Model<any>) {
        return orderModel.create(order);
    }
}

const orderRepository: OrderRepository = new OrderRepository();
export default orderRepository;