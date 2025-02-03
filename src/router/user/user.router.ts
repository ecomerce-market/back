import { userModel } from "./user.scheme";
import { Router, Request, Response } from "express";
import UserService from "./user.service";

const userRouter: Router = Router();

const prefix = "/api/v1/users";

const userService: UserService = new UserService();
/**
 * @openapi
 * /api/v1/users/signup:
 *   post:
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cmd:
 *                   type: string
 *                   example: create user
 */
userRouter.post(prefix + "/signup", (req: Request, res: Response) => {
    userService.signupUser(req, res);
});

export default userRouter;
