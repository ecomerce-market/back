import { model, Model, Schema } from "mongoose";

export const userInventorySchema: Schema = new Schema(
    {
        points: {
            type: Number,
            default: 0,
        },
        tier: {
            type: Schema.Types.ObjectId,
            ref: "userTier",
        },
        coupons: [
            {
                coupon: {
                    type: Schema.Types.ObjectId,
                    ref: "coupon",
                    unique: false,
                },
                createAt: {
                    type: Date,
                    default: Date.now,
                },
                useAt: {
                    type: Date,
                    default: null,
                },
            },
        ],
        likeProducts: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "product",
                    unique: false,
                },
                createAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        carts: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "product",
                    unique: false,
                },
                amount: {
                    type: Number,
                    default: 1,
                },
                createAt: {
                    type: Date,
                    default: Date.now,
                },
                optionName: {
                    type: String,
                },
            },
        ],
    },
    {
        autoCreate: true,
    }
);

export const userInventoryModel = model(
    "userInventory",
    userInventorySchema
) as Model<any>;

export type UserInventory = {
    _id: string;
    points: number;
    tier?: string;
    coupons?: {
        coupon: string;
        createAt: Date;
        useAt?: Date;
    }[];
    likeProducts?: {
        product: string;
        createAt: Date;
    }[];
    carts?: CartItem[];
};

export type CartItem = {
    productId: string;
    amount: number;
    createAt: Date;
    optionName?: string;
};
