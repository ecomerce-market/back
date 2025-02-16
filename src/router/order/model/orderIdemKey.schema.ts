import { Model, model, Schema } from "mongoose";

export const orderIdemKeySchema: Schema = new Schema(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { autoCreate: true, timestamps: true }
);

export const orderIdemKeyModel = model(
    "orderIdemKey",
    orderIdemKeySchema
) as Model<any>;
