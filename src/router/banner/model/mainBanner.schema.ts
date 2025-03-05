import { Model, model, Schema } from "mongoose";

export const mainBannerSchema: Schema = new Schema(
    {
        bannerId: Schema.Types.ObjectId,
        name: {
            type: String,
            required: true,
        },
        imgUrl: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: true,
        },
        startAt: Date,
        endAt: Date,
        deleteAt: Date,
        displayOrder: {
            type: Number,
            default: 1,
        },
    },
    {
        autoCreate: true,
    }
);

export const mainBannerModel = model(
    "mainBanner",
    mainBannerSchema
) as Model<any>;
