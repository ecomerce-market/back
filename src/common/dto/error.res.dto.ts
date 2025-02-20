import { ErrorCode } from "common/constants/errorCode.constants";

export class ErrorDto {
    public errorCode: ErrorCode;

    constructor(errorCode: ErrorCode) {
        this.errorCode = errorCode;
    }
}
