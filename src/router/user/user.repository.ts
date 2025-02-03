import { userModel } from "./user.scheme";

class UserRepository {
    async findByEmailAndDeleteAtNull(email: string): Promise<any> {
        return await userModel
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
