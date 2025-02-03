import * as express from "express";
import homeRouter from "../home/home.router";

class Server {
    app: express.Express;
    port?: number;

    constructor(port: number) {
        this.port = port ?? 3000;
        this.app = express();
    }

    init() {
        this.app.use(express.json());
        this.setRouter();
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
