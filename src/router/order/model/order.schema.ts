import { model, Model, Schema } from "mongoose";

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
            required: true,
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
});

export const orderModel = model("Order", orderSchema) as Model<any>;
