import jwtService from "../../common/jwt.service";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import validateMiddleware from "../../middleware/validate.middleware";
import { ParsedQs } from "qs";

class AuthService {
    validateToken(
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
        res: Response<any, Record<string, any>>
    ): void | Promise<void> {
        if (validateMiddleware.validateCheck(req, res)) {
            return;
        }
        const authorization = req.headers.authorization;
        console.log("authorization: ", authorization);
        const token = authorization?.split("Bearer ")[1];
        if (!token) {
            res.status(401).json({
                message: "Unauthorized",
                code: "E009",
            });
            return;
        }
        const result = jwtService.validateToken(token);

        if (result instanceof Error) {
            res.status(401).json({
                message: "Unauthorized",
                code: "E009",
                error: result.message,
            });
            return;
        } else if (!result) {
            res.status(401).json({
                message: "Unauthorized",
                code: "E009",
            });
            return;
        } else {
            res.status(200).json({
                message: "validation success",
            });
            return;
        }
    }

    async recreateAccessToken(req: Request, res: Response) {
        if (validateMiddleware.validateCheck(req, res)) {
            return;
        }

        const authorization = req.headers.authorization;
        console.log("authorization: ", authorization);
        const refreshToken = authorization?.split("Bearer ")[1];
        if (!refreshToken) {
            res.status(401).json({
                message: "Unauthorized",
                code: "E009",
            });
            return;
        }
        const result = jwtService.validateToken(refreshToken);

        if (result instanceof Error) {
            res.status(401).json({
                message: "Unauthorized",
                code: "E009",
                error: result.message,
            });
            return;
        } else if (!result) {
            res.status(401).json({
                message: "Unauthorized",
                code: "E009",
            });
            return;
        } else {
            const decoded = jwtService.readToken(refreshToken);

            const { accessToken } = jwtService.writeToken({
                loginId: decoded.loginId,
                email: decoded.email,
            });
            res.status(200).json({
                accessToken,
            });
            return;
        }
    }
}

export default AuthService;
