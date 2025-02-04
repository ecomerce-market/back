import * as express from "express";
import { validationResult } from "express-validator";

class ValidateMiddleWare {
    validateCheck(req: express.Request, res: express.Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "request validation failed",
                code: "E000",
                ...errors,
            });
        }
    }
}

const validateMiddleware = new ValidateMiddleWare();

export default validateMiddleware;
