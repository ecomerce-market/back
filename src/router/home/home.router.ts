import { ResDto } from "../../common/dto/common.res.dto";
import { Router, Request, Response } from "express";

const homeRouter: Router = Router();

homeRouter.get("/", (req, res) => {
    getHome(req, res);
});

function getHome(req: Request, res: Response) {
    new ResDto({
        testMessage: "hello, ecommerce-service!",
    }).sendResponse(res);
}

export default homeRouter;
