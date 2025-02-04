import { model, Model, Schema } from "mongoose";

export const couponSchema: Schema = new Schema({
    couponId: Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
    },
    discountPer: {
        type: Number,
        default: null,
    },
    discountWon: {
        type: Number,
        default: null,
    },
    useableType: [
        {
            type: String,
            enum: ["all", "hyundai-card", "bc-card"],
            default: "all",
        },
    ],
    startAt: {
        type: Date,
        required: false,
    },
    endAt: {
        type: Date,
        required: true,
    },
    deleteAt: {
        type: Date,
        default: null,
    },
});

export const couponModel = model("coupon", couponSchema) as Model<any>;
