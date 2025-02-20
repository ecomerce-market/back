import jwtService from "../../common/jwt.service";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import validateMiddleware from "../../middleware/validate.middleware";
import { ParsedQs } from "qs";
import { ResDto } from "../../common/dto/common.res.dto";
import { ErrorDto } from "../../common/dto/error.res.dto";
import { ERRCODE } from "../../common/constants/errorCode.constants";

class AuthService {
    // token 유효성 검사
    validateToken(req: Request, res: Response): ResDto {
        const validateError = validateMiddleware.validateCheck(req, res);
        if (validateError) {
            return validateError;
        }

        const token = this.parseToken(req, res);
        if (!token) {
            return new ErrorDto(ERRCODE.E009);
        }

        const tokenValidateError = this.checkValidateToken(token);
        if (tokenValidateError) {
            return tokenValidateError;
        }

        return new ResDto({ message: "validation success" });
    }

    // access token 재발급
    async recreateAccessToken(req: Request, res: Response): Promise<ResDto> {
        const validateError = validateMiddleware.validateCheck(req, res);
        if (validateError) {
            return validateError;
        }

        const refreshToken = this.parseToken(req, res);
        if (!refreshToken) {
            return new ErrorDto(ERRCODE.E009);
        }

        const tokenValidateError = this.checkValidateToken(refreshToken);
        if (tokenValidateError) {
            return tokenValidateError;
        }
        const decoded = jwtService.readToken(refreshToken);

        const { accessToken } = jwtService.writeToken({
            loginId: decoded.loginId,
            email: decoded.email,
        });

        return new ResDto({
            data: { accessToken },
            message: "recreate success",
        });
    }

    // request 에서 token 추출
    parseToken(req: Request, res: Response): string | undefined {
        const authorization = req.headers.authorization;
        const token = authorization?.split("Bearer ")[1];
        return token;
    }

    // token 유효성 검사 후 에러 발생시 JWT 에러 반환
    checkValidateToken(token: string): ErrorDto | undefined {
        const result = jwtService.validateToken(token);

        if (result instanceof Error || !result) {
            return new ErrorDto(ERRCODE.E009, {
                error: result instanceof Error ? result.message : undefined,
            });
        }
    }
}

export default AuthService;
