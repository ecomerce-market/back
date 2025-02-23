import { Model, model, Schema } from "mongoose";

export const resetTokenSchema: Schema = new Schema(
    {
        expireAt: {
            type: Date,
            default: Date.now,
            // TTL 적용
            // index: { expires: "10s" },
            index: { expires: "5m" },
            // expires: 10, // 10초 (테스트)
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        autoCreate: true,
        autoIndex: true,
    }
);

export const resetTokenModel = model(
    "resetToken",
    resetTokenSchema
) as Model<any>;
