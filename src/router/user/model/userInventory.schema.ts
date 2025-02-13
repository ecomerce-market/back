import { model, Model, Schema } from "mongoose";

export const userInventorySchema: Schema = new Schema(
    {
        inventory_id: Schema.Types.ObjectId,
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
    },
    {
        autoCreate: true,
    }
);

export const userInventoryModel = model(
    "userInventory",
    userInventorySchema
) as Model<any>;
