import swaggerDocs from "../swagger/swagger.provider";
import * as express from "express";
import * as swaggerUI from "swagger-ui-express";
import homeRouter from "../router/home/home.router";
import MongooseProvider from "../database/mongoose.provider";
import userRouter from "../router/user/user.router";
import validateMiddleware from "../middleware/validate.middleware";
import authRouter from "../router/auth/auth.router";
import productRouter from "../router/product/product.route";
import bannerRouter from "../router/banner/banner.route";
import * as cors from "cors";
import orderRouter from "../router/order/order.route";
import globalMiddleware from "../middleware/global.middleware";

class Server {
    app: express.Express;
    port?: number;
    mongo: MongooseProvider;

    constructor(port: number | undefined) {
        if (!port || isNaN(port)) {
            this.port = 3000;
        } else {
            this.port = port;
        }
        this.app = express();
        this.mongo = new MongooseProvider(process.env.MONGO_URI as string);
    }

    init() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(
            cors({
                origin: ["http://localhost:3000"],
                credentials: true,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                allowedHeaders: ["Content-Type", "Authorization"],
            })
        );
        this.app.use(
            "/api-docs",
            swaggerUI.serve,
            swaggerUI.setup(swaggerDocs)
        );
        this.setRouter();
        this.dbconnect();
    }
    dbconnect() {
        this.mongo.openConnection();
    }
    setRouter() {
        this.app.use(homeRouter);
        this.app.use(userRouter);
        this.app.use(authRouter);
        this.app.use(productRouter);
        this.app.use(bannerRouter);
        this.app.use(orderRouter);
        this.app.use(globalMiddleware.globalRouterMiddleware);
    }

    start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

export default Server;
