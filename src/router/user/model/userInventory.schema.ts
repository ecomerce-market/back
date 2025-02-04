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
        // coupons: [],
    },
    {
        autoCreate: true,
    }
);

export const userInventoryModel = model(
    "userInventory",
    userInventorySchema
) as Model<any>;
