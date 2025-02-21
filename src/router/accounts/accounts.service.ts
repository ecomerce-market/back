import { ResDto } from "../../common/dto/common.res.dto";
import { Request, Response } from "express";
import { AccountFindReqDto } from "./dto/accounts.req.dto";
import userRepository from "../../router/user/repository/user.repository";
import { ErrorDto } from "../../common/dto/error.res.dto";
import { ERRCODE } from "../../common/constants/errorCode.constants";
import resetTokenRepository from "./repository/resetToken.repository";

class AccountService {
    async findPassword(req: Request, res: Response): Promise<ResDto> {
        const reqDto: AccountFindReqDto = new AccountFindReqDto(req);

        let user: any = undefined;
        if (reqDto.email !== undefined) {
            user = await userRepository.findByEmailAndDeleteAtNull(
                reqDto.email
            );
        } else {
            if (!reqDto.name || !reqDto.phone) {
                return new ErrorDto(ERRCODE.E010);
            }
            user = await userRepository.findByNameAndPhoneAndDeleteAtNull(
                reqDto.name,
                reqDto.phone
            );
        }

        if (!user) {
            return new ErrorDto(ERRCODE.E002);
        }

        const savedResetToken: any = await resetTokenRepository.findByUserId(
            user._id
        );

        if (savedResetToken) {
            savedResetToken.expireAt = new Date();
            await resetTokenRepository.update(savedResetToken);
            return new ResDto({ data: { resetTokenId: savedResetToken._id } });
        }

        const newResetToken = await resetTokenRepository.create(user._id);
        return new ResDto({ data: { resetTokenId: newResetToken._id } });
    }

    async findLoginId(req: Request, res: Response): Promise<ResDto> {
        const reqDto: AccountFindReqDto = new AccountFindReqDto(req);

        let user: any = undefined;
        if (reqDto.email !== undefined) {
            user = await userRepository.findByEmailAndDeleteAtNull(
                reqDto.email
            );
        } else {
            if (!reqDto.name || !reqDto.phone) {
                return new ErrorDto(ERRCODE.E010);
            }
            user = await userRepository.findByNameAndPhoneAndDeleteAtNull(
                reqDto.name,
                reqDto.phone
            );
        }

        if (!user) {
            return new ErrorDto(ERRCODE.E002);
        }

        return new ResDto({ data: { loginId: user.loginId } });
    }
}

const accountService: AccountService = new AccountService();
export default accountService;
