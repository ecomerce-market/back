import { ERRCODE } from "../common/constants/errorCode.constants";
import { ErrorDto } from "../common/dto/error.res.dto";
import * as express from "express";
import { validationResult } from "express-validator";

class ValidateMiddleWare {
    validateCheck(
        req: express.Request,
        res: express.Response
    ): ErrorDto | undefined {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return new ErrorDto(ERRCODE.E000);
        }
    }
}

const validateMiddleware = new ValidateMiddleWare();

export default validateMiddleware;
