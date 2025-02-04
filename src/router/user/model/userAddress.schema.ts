import { model, Model, Schema } from "mongoose";

export const userAddressSchema: Schema = new Schema(
    {
        addressId: Schema.Types.ObjectId,
        zipcode: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: true,
        },
        extraAddress: String,
        createAt: Date,
        defaultAddr: {
            type: Boolean,
            default: false,
        },
    },
    {
        autoCreate: true,
    }
);

export const userAddressModel = model(
    "userAddress",
    userAddressSchema
) as Model<any>;
