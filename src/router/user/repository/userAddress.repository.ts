import { Model } from "mongoose";
import { userAddressModel } from "../model/userAddress.schema";

class UserAddressRepository {
    async delete(addressId: any) {
        return userAddressModel.deleteOne({
            _id: addressId,
        });
    }
    async findById(addressId: string) {
        return userAddressModel.findById(addressId);
    }
    async update(address: any) {
        return userAddressModel.updateOne({ _id: address._id }, address);
    }

    async updateBulk(address: Array<any>) {
        return userAddressModel.bulkWrite(
            address.map((address) => ({
                updateOne: {
                    filter: { _id: address._id },
                    update: {
                        $set: address,
                    },
                },
            }))
        );
    }

    async save(address: Model<any>) {
        return userAddressModel.create(address);
    }
}

const userAddressRepository = new UserAddressRepository();
export default userAddressRepository;
