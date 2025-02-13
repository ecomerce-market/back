import { Model } from "mongoose";
import { userAddressModel } from "../model/userAddress.schema";

class UserAddressRepository {
    async update(address: any) {
        return userAddressModel.updateOne({ _id: address._id }, address);
    }
    async save(address: Model<any>) {
        return userAddressModel.create(address);
    }
}

const userAddressRepository = new UserAddressRepository();
export default userAddressRepository;
