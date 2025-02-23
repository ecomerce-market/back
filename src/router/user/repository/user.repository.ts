import { Model } from "mongoose";
import { userModel } from "../model/user.schema";

class UserRepository {
    async findByIdAndDeleteAtNull(_id: any) {
        return userModel.findOne().where({
            _id: { $eq: _id },
            deleteAt: { $eq: null },
        });
    }
    async findByEmailAndDeleteAtNull(email: string) {
        return userModel.findOne().where({
            email: { $eq: email },
            deleteAt: { $eq: null },
        });
    }
    async findByNameAndPhoneAndDeleteAtNull(name: string, phone: string) {
        return userModel.findOne().where({
            name: name,
            phone: phone,
            deleteAt: { $eq: null },
        });
    }
    async update(user: any) {
        return userModel.updateOne(
            { _id: user._id },
            { $set: user },
            { upsert: false }
        );
    }

    async findByLoginIdAndDeleteAtNull(loginId: string): Promise<any> {
        return userModel
            .findOne()
            .where({
                loginId: { $eq: loginId },
                deleteAt: { $eq: null },
            })
            .exec();
    }
    async save(user: Model<any>) {
        return userModel.create(user);
    }

    async findByLoginIdOrEmailAndDeleteAtNull(
        loginId: string,
        email: string
    ): Promise<any> {
        return userModel
            .find()
            .where({
                $or: [{ loginId: { $eq: loginId } }, { email: { $eq: email } }],
                deleteAt: { $eq: null },
            })
            .exec();
    }
}

const userRepository = new UserRepository();
export default userRepository;
