import { ERRCODE } from "../common/constants/errorCode.constants";
import { ErrorDto } from "../common/dto/error.res.dto";
import * as express from "express";
class GlobalMiddleware {
    async globalRouterMiddleware(
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        console.error(err.stack);
        new ErrorDto(ERRCODE.E999).sendResponse(res);
    }
}

const globalMiddleware = new GlobalMiddleware();
export default globalMiddleware;
