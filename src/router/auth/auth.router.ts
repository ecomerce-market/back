import { Request, Response, Router } from "express";
import AuthService from "./auth.service";
import { PATH_AUTH } from "../../router/router.constants";
import { header } from "express-validator";
import { ResDto } from "common/dto/common.res.dto";

const authRouter: Router = Router();

const authService: AuthService = new AuthService();

authRouter.post(
    PATH_AUTH + "/validate",
    header("Authorization")
        .exists({ values: "null" })
        .isString()
        .contains("Bearer "),
    (req: Request, res: Response) => {
        const response = authService.validateToken(req, res);
        response.sendResponse(res);
    }
);

authRouter.post(
    PATH_AUTH + "/refresh",
    header("Authorization")
        .exists({ values: "null" })
        .isString()
        .contains("Bearer "),
    async (req: Request, res: Response) => {
        const response = await authService.recreateAccessToken(req, res);
        response.sendResponse(res);
    }
);

export default authRouter;
