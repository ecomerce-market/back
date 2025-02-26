import { UserInventory } from "../model/userInventory.schema";
import { CartItem } from "./userCart.req.dto";

// type CartResItem = UserInventory["carts"][];

// export type CartResItem = UserInventory["carts"][] & {
//     productName?: string;
//     orgPrice?: number;
//     finalPrice?: number;
//     optOrgPrice?: number;
//     additionalPrice?: number;
//     deliveryInfo?: string;
//     deliveryFee?: number;
// };

export interface CartResDto {
    carts: Array<CartResItem>;
    totalPrice: number;
    totalDeliveryFee: number;
    totalDiscountPrice: number;
    finalPrice: number;
}

export class CartResItem {
    productId: string;
    amount: number;
    optionName?: string;
    mainImgUrl?: string;
    productName: string;
    orgPrice: number;
    finalPrice: number;
    optOrgPrice?: number;
    additionalPrice?: number;
    deliveryInfo: string;
    deliveryFee: number;

    constructor(userCart: CartItem) {
        this.productId = userCart.productId;
        this.amount = userCart.amount;
        this.optionName = userCart.optionName;
        this.productName = "";
        this.orgPrice = 0;
        this.finalPrice = 0;
        this.deliveryInfo = "";
        this.deliveryFee = 0;
    }
}
