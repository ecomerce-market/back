import { model, Model, Schema } from "mongoose";

export const userSchema: Schema = new Schema({
    _userId: Schema.Types.ObjectId,
    loginId: String,
    loginPw: String,
    name: String,
    email: String,
    phone: String,
    birth: String,
    deleteAt: Schema.Types.Date,
});

export const userModel = model("User", userSchema) as Model<any>;
