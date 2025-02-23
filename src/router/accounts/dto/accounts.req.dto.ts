import { Request } from "express";

export class AccountFindReqDto {
    name: string;
    phone: string;
    email: string;

    constructor(req: Request) {
        this.name = req.body.name as string;
        this.phone = req.body.phone as string;
        this.email = req.body.email as string;
    }
}

export class AccountPasswordResetReqDto {
    resetTokenId: string;
    loginPw: string;

    constructor(req: Request) {
        this.resetTokenId = req.body.resetTokenId as string;
        this.loginPw = req.body.loginPw as string;
    }
}
