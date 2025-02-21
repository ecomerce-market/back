import { Request, Response, Router } from "express";
import { query } from "express-validator";
import { PATH_ACCOUNTS } from "../../router/router.constants";
import accountService from "./accounts.service";

const accountRouter = Router();

accountRouter.post(
    PATH_ACCOUNTS + "/loginids",
    query("name").exists({ values: "null" }).isString().isLength({ max: 16 }),
    query("phone")
        .exists({ values: "null" })
        .isString()
        .isLength({ min: 3, max: 16 }),
    async (req: Request, res: Response) => {
        const response = await accountService.findLoginId(req, res);
        response.sendResponse(res);
    }
);

export default accountRouter;
