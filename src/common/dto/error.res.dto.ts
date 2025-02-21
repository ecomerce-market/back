import { ErrorCode } from "common/constants/errorCode.constants";
import { ResDto } from "./common.res.dto";
import { Response } from "express";

export class ErrorDto extends ResDto {
    public errorCode: ErrorCode;

    constructor(errorCode: ErrorCode, extraData: any = {}) {
        super({
            data: extraData,
            message: errorCode.message,
            status: errorCode.status,
        });
        this.errorCode = errorCode;
    }

    sendResponse(res: Response): void {
        res.status(this.errorCode.status).json({
            message: this.errorCode.message,
            code: this.errorCode.code,
            desc: this.errorCode.desc,
            ...this.data,
        });
    }
}
