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
}

export default AuthService;
