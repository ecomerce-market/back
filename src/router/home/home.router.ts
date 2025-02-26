import { swaggerSpec } from "../../swagger/swagger.provider";
import { ResDto } from "../../common/dto/common.res.dto";
import { Router, Request, Response } from "express";

const homeRouter: Router = Router();

homeRouter.get("/", (req, res) => {
    getHome(req, res);
});

homeRouter.get("/v3/api-docs", (req: Request, res: Response) => {
    res.status(200).send(swaggerSpec);
});

function getHome(req: Request, res: Response) {
    new ResDto({
        data: { testMessage: "hello, ecommerce-service!" },
    }).sendResponse(res);
}

export default homeRouter;
