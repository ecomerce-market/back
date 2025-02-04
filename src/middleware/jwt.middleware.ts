import jwtService from "../common/jwt.service";
import * as express from "express";

class JwtMiddleware {
    async jwtMiddleWare(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
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
        } else {
            const decoded = jwtService.readToken(token);
            req.headers["X-Request-user-id"] = decoded.loginId;
            next();
        }
    }
}

const jwtMiddleware = new JwtMiddleware();
export default jwtMiddleware;
