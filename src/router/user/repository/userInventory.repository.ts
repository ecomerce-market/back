import { Model } from "mongoose";
import { userInventoryModel } from "../model/userInventory.schema";

class UserInventoryRepository {
    async save(userInventory: Model<any>) {
        return userInventoryModel.create(userInventory);
    }
}

const userInventoryRepository = new UserInventoryRepository();
export default userInventoryRepository;
