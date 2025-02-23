import { resetTokenModel } from "../model/resetToken.schema";

class ResetTokenRepository {
    async delete(resetToken: any) {
        return resetTokenModel.deleteOne({ _id: resetToken._id });
    }
    async update(resetToken: any) {
        return resetTokenModel.updateOne(
            { _id: resetToken._id },
            {
                $set: resetToken,
            }
        );
    }
    async create(userId: string) {
        return resetTokenModel.create({ userId: userId });
    }

    async findById(id: string) {
        return resetTokenModel.findById(id);
    }

    async findByUserId(userId: string) {
        return resetTokenModel.findOne({ userId: userId });
    }
}

const resetTokenRepository: ResetTokenRepository = new ResetTokenRepository();
export default resetTokenRepository;
