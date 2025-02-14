import { Schema } from "mongoose";

export const orderSchema = new Schema({
    _id: Schema.Types.ObjectId,
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
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
            ref: "UserAddress",
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
            ref: "User",
            required: true,
        },
    },
    usedPoints: Number,
    paymentMethod: {
        type: String,
        enum: ["card", "simple", "phone"],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "unpaid"],
        required: true,
        default: "unpaid",
    },
});
