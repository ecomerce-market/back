import { ResDto } from "../../common/dto/common.res.dto";
import { Request, Response } from "express";
import { AccountLoginIdFindReqDto } from "./dto/accounts.req.dto";
import userRepository from "../../router/user/repository/user.repository";
import { ErrorDto } from "../../common/dto/error.res.dto";
import { ERRCODE } from "../../common/constants/errorCode.constants";

class AccountService {
    async findLoginId(req: Request, res: Response): Promise<ResDto> {
        const reqDto: AccountLoginIdFindReqDto = new AccountLoginIdFindReqDto(
            req
        );

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
