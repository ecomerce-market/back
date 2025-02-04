import { json } from "stream/consumers";
import { userModel } from "./user.scheme";
import { Request, Response } from "express";
import userRepository from "./user.repository";
import * as bcrypt from "bcrypt";
import jwtService from "../../common/jwt.service";

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
                message: "email already exists",
                code: "E001",
            });
        }

        const { hashedPassword, salt } = this.hashPassword(body.loginPw);

        const newUser = new userModel({
            ...body,
            salt,
            loginPw: hashedPassword,
        });

        const user = await userRepository.save(newUser);
        console.log("user", user);
        return res.status(200).json({
            message: "success",
        });
    }

    async signinUser(req: Request, res: Response) {
        const body: UserSignInReqDto = req.body;
        const found = await userRepository.findByLoginIdAndDeleteAtNull(
            body.loginId
        );

        console.log(found);

        if (!found) {
            return res.status(400).json({
                message: "user not found",
                code: "E002",
            });
        }
        if (!this.comparePassword(body.loginPw, found.loginPw)) {
            return res.status(400).json({
                message: "password is incorrect",
                code: "E003",
            });
        }

        return res.status(200).json({
            jwt: jwtService.writeToken({
                loginId: found.loginId,
                email: found.email,
            }),
        });
    }

    hashPassword(password: string) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        return { hashedPassword, salt };
    }

    comparePassword(rawPassword: string, hashedPassword: string) {
        return bcrypt.compareSync(rawPassword, hashedPassword);
    }
}

export default UserService;
