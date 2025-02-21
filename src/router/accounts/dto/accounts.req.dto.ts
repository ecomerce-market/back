import { Request } from "express";

export class AccountLoginIdFindReqDto {
    name: string;
    phone: string;

    constructor(req: Request) {
        this.name = req.body.name as string;
        this.phone = req.body.phone as string;
    }
}
