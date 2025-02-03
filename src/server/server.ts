import openapiSpecification from "../swagger/swagger.provider";
import * as express from "express";
import * as swaggerUI from "swagger-ui-express";
import homeRouter from "../home/home.router";
import MongooseProvider from "../database/mongoose.provider";

class Server {
    app: express.Express;
    port?: number;

    constructor(port: number | undefined) {
        if (!port || isNaN(port)) {
            this.port = 3000;
        } else {
            this.port = port;
        }
        this.app = express();
    }

    init() {
        this.app.use(express.json());
        this.app.use(
            "/api-docs",
            swaggerUI.serve,
            swaggerUI.setup(openapiSpecification)
        );
        this.setRouter();
        this.dbconnect();
    }
    dbconnect() {
        const mongo: MongooseProvider = new MongooseProvider(
            process.env.MONGO_URI as string
        );

        mongo.openConnection();
    }
    setRouter() {
        this.app.use(homeRouter);
    }

    start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

export default Server;
