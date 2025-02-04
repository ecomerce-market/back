import { Request, Response, Router } from "express";
import AuthService from "./auth.service";
import { PATH_AUTH } from "../../router/router.constants";
import { header } from "express-validator";

const authRouter: Router = Router();

const authService: AuthService = new AuthService();

authRouter.post(
    PATH_AUTH + "/validate",
    header("Authorization")
        .exists({ values: "null" })
        .isString()
        .contains("Bearer "),
    (req: Request, res: Response) => {
        return authService.validateToken(req, res);
    }
);

export default authRouter;
