import { Request } from "express";

export class UserCartAddReqDto {
    products: Array<CartItem>;

    constructor(req: Request) {
        this.products = req.body.products;
        // this.productId = req.body.productId;
        // this.amount = req.body.amount;
        // this.optionName = req.body.optionName;
    }
}

export class UserCartDeleteParam {
    amount?: number;
    optionName?: string;

    constructor(req: Request) {
        this.amount = req.query.amount ? Number(req.query.amount) : undefined;
        this.optionName = req.query.optionName
            ? String(req.query.optionName)
            : undefined;
    }
}

export type CartItem = {
    productId: string;
    amount: number;
    optionName?: string;
};
