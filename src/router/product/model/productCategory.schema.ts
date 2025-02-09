import { Model, model, Schema } from "mongoose";

export const productCategorySchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        depth: {
            type: Number,
            required: true,
            default: 1,
        },
        name: {
            type: String,
            required: true,
        },
        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: "productCategory",
        },
        childCategories: [
            {
                type: Schema.Types.ObjectId,
                ref: "productCategory",
            },
        ],
        // categoryCoupon: {},
    },
    {
        autoCreate: true,
    }
);

export const productCategoryModel = model(
    "productCategory",
    productCategorySchema
) as Model<any>;
