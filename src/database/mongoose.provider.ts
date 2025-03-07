import * as mongoose from "mongoose";
import "../router/coupon/model/coupon.schema"; // Importing the schema file to register the schema
import "../router/product/model/product.schema"; // Importing the schema file to register the schema

class MongooseProvider {
    path: string;
    constructor(path: string) {
        this.path = path;
        mongoose.set("strictQuery", false);
        mongoose.set("debug", true);
        mongoose.connection.on("open", () => {
            console.log("Mongoose connection open");
        });
    }

    async openConnection() {
        console.log("Mongoose connection opening...");
        try {
            await mongoose.connect(this.path);
        } catch (error: any) {
            throw new Error("Mongoose connection error: " + error.message);
        }
        console.log("Mongoose connection success");
    }

    closeConnection() {
        mongoose.connection.close();
        console.log("Mongoose connection closed");
    }
}

export default MongooseProvider;
