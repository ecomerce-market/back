import { model, Model } from "mongoose";
import { userModel } from "./user.scheme";

class UserRepository {
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

    async findByEmailAndDeleteAtNull(email: string): Promise<any> {
        return userModel
            .find()
            .where({
                email: { $eq: email },
                deleteAt: { $eq: null },
            })
            .exec();
    }
}

const userRepository = new UserRepository();
export default userRepository;
