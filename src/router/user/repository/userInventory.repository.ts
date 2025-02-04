import { Model } from "mongoose";
import { userInventoryModel } from "../model/userInventory.schema";

class UserInventoryRepository {
    async save(userInventory: Model<any>) {
        return userInventoryModel.create(userInventory);
    }
    async pushCoupon(inventory: any, coupon: any) {
        return userInventoryModel.updateOne(
            { _id: inventory._id },
            { $push: { coupons: coupon } }
        );
    }
}

const userInventoryRepository = new UserInventoryRepository();
export default userInventoryRepository;
