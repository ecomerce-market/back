import { Model, model, Schema, Types } from "mongoose";

export const orderIdemKeySchema: Schema = new Schema(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
        },
        orderId: {
            type: Types.ObjectId,
            ref: "Order",
            required: true,
        },
    },
    { autoCreate: true, timestamps: true }
);

export const orderIdemKeyModel = model(
    "orderIdemKey",
    orderIdemKeySchema
) as Model<any>;
