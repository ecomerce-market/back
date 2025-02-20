import { model, Model, Schema } from "mongoose";

export const userSchema: Schema = new Schema(
    {
        _userId: Schema.Types.ObjectId,
        loginId: {
            type: String,
            required: true,
        },
        loginPw: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        birth: {
            type: String,
            required: true,
        },
        deleteAt: {
            type: Date,
        },
        inventory: {
            type: Schema.Types.ObjectId,
            ref: "userInventory",
        },
        addresses: [
            {
                type: Schema.Types.ObjectId,
                ref: "userAddress",
            },
        ],
    },
    {
        autoCreate: true,
    }
);

export const userModel = model("user", userSchema) as Model<any>;
