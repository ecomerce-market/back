import { model, Model, Schema } from "mongoose";

export const userOauth2Schema: Schema = new Schema(
    {
        oauth2Id: Schema.Types.ObjectId,
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        uniqueId: {
            type: String,
            required: true,
            unique: true,
        },
        provider: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
    },
    {
        autoCreate: true,
    }
);

export const userOauth2Model = model(
    "userOauth2",
    userOauth2Schema
) as Model<any>;
