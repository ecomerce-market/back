import { model, Model, Schema } from "mongoose";
import { Product } from "router/product/model/product.schema";
import { User } from "router/user/model/user.schema";

export const orderSchema = new Schema({
    // _id: Schema.Types.ObjectId,
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "product",
                required: true,
            },
            amount: {
                type: Number,
                required: true,
                default: 1,
            },
            optionName: String,
            deliveryInfo: {
                deliveryStatus: {
                    type: String,
                    enum: ["ready", "shipping", "delivered"],
                    default: "ready",
                },
                deliveryComp: {
                    type: String,
                },
            },
            orgPrice: {
                type: Number,
            },
            finalPrice: {
                type: Number,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    addressInfo: {
        userAddress: {
            type: Schema.Types.ObjectId,
            ref: "userAddress",
        },
    },
    userCoupon: {
        type: Schema.Types.ObjectId,
        ref: "coupon",
        unique: false,
    },
    userInfo: {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    },
    usedPoints: Number,
    paymentMethod: {
        type: String,
        enum: ["none", "card", "simple", "phone"],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "unpaid"],
        required: true,
        default: "unpaid",
    },
    approveAt: {
        type: Date,
        required: false,
    },
});

export const orderModel = model("Order", orderSchema) as Model<any>;

export type Order = {
    _id: string;
    products: OrderProduct[];
    totalPrice: number;
    addressInfo: {
        userAddress: string;
    };
    userCoupon: string;
    userInfo: {
        user: User | string;
    };
    usedPoints?: number;
    paymentMethod: string;
    paymentStatus: string;
    approveAt: Date;
};

export type OrderProduct = Product & {
    productId: Product | string;
    amount: number;
    optionName: string;
    deliveryInfo: {
        deliveryStatus: string;
        deliveryComp: string;
    };
    orgPrice: number;
    finalPrice: number;
};
