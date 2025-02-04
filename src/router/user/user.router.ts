import { PATH_USERS } from "./../router.constants";
import { Router, Request, Response } from "express";
import UserService from "./user.service";

const userRouter: Router = Router();

const userService: UserService = new UserService();

userRouter.post(PATH_USERS + "/signup", (req: Request, res: Response) => {
    userService.signupUser(req, res);
});

userRouter.post(PATH_USERS + "/signin", (req: Request, res: Response) => {
    userService.signinUser(req, res);
});

export default userRouter;
