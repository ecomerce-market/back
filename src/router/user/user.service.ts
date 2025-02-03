import { json } from "stream/consumers";
import { userModel } from "./user.scheme";
import { Request, Response } from "express";
import userRepository from "./user.repository";
class UserService {
    constructor() {}

    async signupUser(req: Request, res: Response) {
        const body: UserSignupReqDto = req.body;
        const found = await userRepository.findByEmailAndDeleteAtNull(
            body.email
        );

        console.log(found);

        if (found.length > 0) {
            return res.status(400).json({
                error: "email already exists",
            });
        } else {
            return res.status(200).json({
                message: "success",
            });
        }
    }
}

export default UserService;
