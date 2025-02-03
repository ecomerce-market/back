import { Router, Request, Response } from "express";

const homeRouter: Router = Router();

// exam route
homeRouter.get("/", (req, res) => {
    getHome(req, res);
});

// exam route handler ==> todo: MAKE SERVICE LAYER
function getHome(req: Request, res: Response) {
    return res.json({
        testMessage: "hello, ecommerce-service!",
    });
}

export default homeRouter;
