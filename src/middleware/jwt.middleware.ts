import { ErrorDto } from "../common/dto/error.res.dto";
import jwtService from "../common/jwt.service";
import * as express from "express";
import { ERRCODE } from "../common/constants/errorCode.constants";

class JwtMiddleware {
    // JWT 토큰이 없으면 거부하는 미들웨어
    async jwtMiddleWare(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const token = this.parseToken(req);
        if (!token) {
            new ErrorDto(ERRCODE.E009).sendResponse(res);
            return;
        }
        const result = jwtService.validateToken(token);

        if (result instanceof Error || !result) {
            new ErrorDto(ERRCODE.E009, {
                error: result instanceof Error ? result.message : undefined,
            }).sendResponse(res);
            return;
        } else {
            const decoded = jwtService.readToken(token);
            this.setDecodedJwtHeader(req, { loginId: decoded.loginId });
            next();
        }
    }

    // JWT 토큰이 없어도 통과하는 미들웨어
    async optionalJwtMiddleWare(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const token = this.parseToken(req);
        if (!token) {
            next();
            return;
        }
        const result = jwtService.validateToken(token);

        if (!(result instanceof Error) && result) {
            const decoded = jwtService.readToken(token);
            this.setDecodedJwtHeader(req, { loginId: decoded.loginId });
        }
        next();
    }

    // 토큰을 파싱하는 함수
    parseToken(req: express.Request): string | undefined {
        const authorization = req.headers.authorization;
        const token = authorization?.split("Bearer ")[1];
        return token;
    }

    // 헤더에 디코딩된 JWT 정보를 저장하는 함수
    setDecodedJwtHeader(req: express.Request, data: { loginId: string }) {
        req.headers["X-Request-user-id"] = data.loginId;
    }
}

const jwtMiddleware = new JwtMiddleware();
export default jwtMiddleware;
