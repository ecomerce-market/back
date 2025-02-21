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
