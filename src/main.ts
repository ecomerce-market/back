import Server from "./server/server";

const port: number = Number(process.env.SERVER_PORT);
const server: Server = new Server(port);
server.init();
server.start();
