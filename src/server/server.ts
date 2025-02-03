import * as express from "express";

class Server {
    app: express.Express;
    port?: number;

    constructor(port: number) {
        this.port = port ?? 3000;
        this.app = express();
    }

    start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

export default Server;
