import { userInventoryModel } from "./model/userInventory.schema";
import { json } from "stream/consumers";
import { userModel } from "./model/user.scheme";
import { Request, Response } from "express";
import userRepository from "./repository/user.repository";
import * as bcrypt from "bcrypt";
import jwtService from "../../common/jwt.service";
import validateMiddleware from "../../middleware/validate.middleware";
import userInventoryRepository from "./repository/userInventory.repository";
import { userAddressModel } from "./model/userAddress.schema";
import userAddressRepository from "./repository/userAddress.repository";

class UserService {
    constructor() {}

    async existsUser(
        req: Request<
            import("express-serve-static-core").ParamsDictionary,
            any,
            any,
            import("qs").ParsedQs,
            Record<string, any>
        >,
        res: Response<any, Record<string, any>>
    ) {
        const loginId = req.query.loginId as string;
        if (!loginId) {
            return res.status(400).json({
                message: "loginId is required",
                code: "E004",
            });
        }
        const found =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        if (!found) {
            return res.status(200).json({
                message: "user not found",
            });
        } else {
            return res.status(400).json({
                message: "user exists",
                code: "E005",
            });
        }
    }

    async signupUser(req: Request, res: Response) {
        if (validateMiddleware.validateCheck(req, res)) {
            return;
        }
        const body: UserReqDto.UserSignUp = req.body;
        const found = await userRepository.findByLoginIdOrEmailAndDeleteAtNull(
            body.loginId,
            body.email
        );

        if (found.length > 0) {
            return res.status(400).json({
                message: "email or loginId already exists",
                code: "E001",
            });
        }

        const { hashedPassword, salt } = this.hashPassword(body.loginPw);

        const newUser = new userModel({
            ...body,
            loginPw: hashedPassword,
            addresses: [
                new userAddressModel({
                    address: body.address,
                    extraAddress: body.extraAddr ?? null,
                    defaultAddr: true,
                }),
            ],
        });

        const user = await userRepository.save(newUser);

        const userInventory = new userInventoryModel({
            userId: user._id,
            coupons: [],
        });
        user.inventory = userInventory._id;

        await userInventoryRepository.save(userInventory);
        await userRepository.update(user);
        await userAddressRepository.save(newUser.addresses[0]);
        return res.status(200).json({
            message: "success",
        });
    }

    async signinUser(req: Request, res: Response) {
        if (validateMiddleware.validateCheck(req, res)) {
            return;
        }
        const body: UserReqDto.UserSignIn = req.body;
        const found = await userRepository.findByLoginIdAndDeleteAtNull(
            body.loginId
        );

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
            name: found.name,
        });
    }

    async getProfiles(
        req: Request<
            import("express-serve-static-core").ParamsDictionary,
            any,
            any,
            import("qs").ParsedQs,
            Record<string, any>
        >,
        res: Response<any, Record<string, any>>
    ) {
        const loginId = req.headers["X-Request-user-id"] as string;

        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userFullData = await userModel.populate(user, {
            path: "inventory",
        });

        const resDto: UserResDto.UserProfile = {
            tier: userFullData.inventory.tier ?? "기본",
            name: userFullData.name,
            loginId: userFullData.loginId,
            email: userFullData.email,
            phone: userFullData.phone,
            birth: userFullData.birth,
            points: userFullData.inventory.points,
            couponCnt: userFullData.inventory.coupons?.length ?? null,
        };

        return res.status(200).json({
            message: "success",
            data: resDto,
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
