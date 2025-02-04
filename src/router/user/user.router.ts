import { Router, Request, Response } from "express";
import UserService from "./user.service";

const userRouter: Router = Router();

const prefix = "/api/v1/users";

const userService: UserService = new UserService();

userRouter.post(prefix + "/signup", (req: Request, res: Response) => {
    userService.signupUser(req, res);
});

userRouter.post(prefix + "/signin", (req: Request, res: Response) => {
    userService.signinUser(req, res);
});

export default userRouter;
