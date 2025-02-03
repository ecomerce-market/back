class Server {
    constructor(port) {
        const express = require("express");
        this.app = express();
        if (!port) {
            this.port = 3000;
        } else {
            this.port = port;
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
}

module.exports = new Server();
