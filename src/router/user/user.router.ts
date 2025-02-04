import { PATH_USERS } from "./../router.constants";
import { Router, Request, Response } from "express";
import UserService from "./user.service";
import { body } from "express-validator";
import jwtMiddleware from "../../middleware/jwt.middleware";

const userRouter: Router = Router();

const userService: UserService = new UserService();

userRouter.get(PATH_USERS + "/exists", (req: Request, res: Response) => {
    userService.existsUser(req, res);
});

userRouter.post(
    PATH_USERS + "/signup",
    body("loginId")
        .exists({ values: "null" })
        .isString()
        .isLength({ min: 8, max: 32 }),
    body("loginPw")
        .exists({ values: "null" })
        .isString()
        .isLength({ min: 8, max: 32 }),
    body("name").exists({ values: "null" }).isString().isLength({ max: 16 }),
    body("email").exists({ values: "null" }).isString().isEmail(),
    body("phone").exists({ values: "null" }).isString(),
    body("address")
        .exists({ values: "null" })
        .isString()
        .isLength({ max: 1024 }),
    body("birth")
        .exists({ values: "null" })
        .isString()
        .isLength({ min: 10, max: 10 }),
    (req: Request, res: Response) => {
        userService.signupUser(req, res);
    }
);

userRouter.post(
    PATH_USERS + "/signin",
    body("loginId").isString().isLength({ min: 8, max: 32 }),
    body("loginPw").isString().isLength({ min: 8, max: 32 }),
    (req: Request, res: Response) => {
        userService.signinUser(req, res);
    }
);

userRouter.get(
    PATH_USERS + "/profiles",
    jwtMiddleware.jwtMiddleWare,
    (req: Request, res: Response) => {
        userService.getProfiles(req, res);
    }
);

userRouter.post(
    PATH_USERS + "/passwords",
    jwtMiddleware.jwtMiddleWare,
    body("loginPw").isString().isLength({ min: 8, max: 32 }),
    (req: Request, res: Response) => {
        userService.checkPassword(req, res);
    }
);

export default userRouter;
