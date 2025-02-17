import { orderIdemKeyModel } from "../model/orderIdemKey.schema";

class OrderIdemKeyRepository {
    async save(orderIdemData: { uuid: string; orderId: string }) {
        return orderIdemKeyModel.create(orderIdemData);
    }
    async findByIdAndUuidAndOrderId(
        uuid: string,
        orderId: string
    ): Promise<any> {
        return orderIdemKeyModel.findOne({
            uuid,
            orderId,
        });
    }
}

const orderIdemKeyRepository = new OrderIdemKeyRepository();
export default orderIdemKeyRepository;
