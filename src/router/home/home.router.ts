import { Router, Request, Response } from "express";

const homeRouter: Router = Router();

homeRouter.get("/", (req, res) => {
    getHome(req, res);
});

function getHome(req: Request, res: Response) {
    return res.json({
        testMessage: "hello, ecommerce-service!",
    });
}

export default homeRouter;
