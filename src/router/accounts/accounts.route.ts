import { Request, Response, Router } from "express";
import { body, query } from "express-validator";
import { PATH_ACCOUNTS } from "../../router/router.constants";
import accountService from "./accounts.service";

const accountRouter = Router();

accountRouter.post(
    PATH_ACCOUNTS + "/loginids",
    body("name").optional().isString().isLength({ max: 16 }),
    body("phone").optional().isString().isLength({ min: 3, max: 16 }),
    body("email").optional().isString().isEmail(),
    async (req: Request, res: Response) => {
        const response = await accountService.findLoginId(req, res);
        response.sendResponse(res);
    }
);

accountRouter.post(
    PATH_ACCOUNTS + "/passwords",
    body("name").optional().isString().isLength({ max: 16 }),
    body("phone").optional().isString().isLength({ min: 3, max: 16 }),
    body("loginId").optional().isString().isLength({ min: 8, max: 32 }),
    async (req: Request, res: Response) => {
        const response = await accountService.findPassword(req, res);
        response.sendResponse(res);
    }
);

accountRouter.post(
    PATH_ACCOUNTS + "/passwords/reset",
    body("resetTokenId").exists({ values: "null" }).isString().isMongoId(),
    body("loginPw")
        .exists({ values: "null" })
        .isString()
        .isLength({ min: 8, max: 32 }),
    async (req: Request, res: Response) => {
        const response = await accountService.resetPassword(req, res);
        response.sendResponse(res);
    }
);

export default accountRouter;
