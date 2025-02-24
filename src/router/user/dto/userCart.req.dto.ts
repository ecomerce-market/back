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

export type CartItem = {
    productId: string;
    amount: number;
    optionName?: string;
};
