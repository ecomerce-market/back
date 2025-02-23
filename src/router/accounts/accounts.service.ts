import { ResDto } from "../../common/dto/common.res.dto";
import { Request, Response } from "express";
import {
    AccountFindReqDto,
    AccountPasswordResetReqDto,
} from "./dto/accounts.req.dto";
import userRepository from "../../router/user/repository/user.repository";
import { ErrorDto } from "../../common/dto/error.res.dto";
import { ERRCODE } from "../../common/constants/errorCode.constants";
import resetTokenRepository from "./repository/resetToken.repository";
import { validateRequest } from "../../common/decorators/validate.decorator";
import { resetTokenModel } from "./model/resetToken.schema";
import userService from "../../router/user/user.service";

class AccountService {
    @validateRequest
    async resetPassword(req: Request, res: Response): Promise<ResDto> {
        const reqDto: AccountPasswordResetReqDto =
            new AccountPasswordResetReqDto(req);

        const resetToken = await resetTokenRepository.findById(
            reqDto.resetTokenId
        );

        if (!resetToken) {
            return new ErrorDto(ERRCODE.E011);
        }

        const user = await userRepository.findByIdAndDeleteAtNull(
            resetToken.userId
        );
        resetTokenRepository.delete(resetToken);

        const { hashedPassword, salt } = userService.hashPassword(
            reqDto.loginPw
        );

        console.log("user", user);

        console.log("hashedPassword", hashedPassword);
        user.loginPw = hashedPassword;

        await userRepository.update(user);

        return new ResDto({
            message: "password reset success",
        });
    }

    @validateRequest
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

    @validateRequest
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
