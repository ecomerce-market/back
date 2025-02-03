import { userModel } from "./user.scheme";
import { Router, Request, Response } from "express";

const userRouter: Router = Router();

userRouter.post("/users", (req: Request, res: Response) => {
    res.json({
        cmd: "create user",
    });
});

export default userRouter;
