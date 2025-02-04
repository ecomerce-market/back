import { model, Model, Schema } from "mongoose";

export const userTierSchema: Schema = new Schema(
    {
        tierId: Schema.Types.ObjectId,
        name: String,
        monthlyPaymentMin: Number,
        rewardRate: Number,
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    },
    {
        autoCreate: true,
    }
);

export const userTierModel = model("userTier", userTierSchema) as Model<any>;
