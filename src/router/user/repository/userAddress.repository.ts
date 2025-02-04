import { Model } from "mongoose";
import { userAddressModel } from "../model/userAddress.schema";

class UserAddressRepository {
    async save(address: Model<any>) {
        return userAddressModel.create(address);
    }
}

const userAddressRepository = new UserAddressRepository();
export default userAddressRepository;
