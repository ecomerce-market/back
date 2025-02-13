import { PATH_USERS } from "./../router.constants";
import { Router, Request, Response } from "express";
import UserService from "./user.service";
import { body, param } from "express-validator";
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
    body("phone")
        .exists({ values: "null" })
        .isString()
        .isLength({ min: 3, max: 16 }),
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

userRouter.patch(
    PATH_USERS + "/profiles",
    jwtMiddleware.jwtMiddleWare,
    body("loginPw").optional().isString().isLength({ min: 8, max: 32 }),
    body("name").optional().isString().isLength({ max: 16 }),
    body("email").optional().isString().isEmail(),
    body("phone").optional().isString().isLength({ min: 3, max: 16 }),
    body("birth").optional().isString().isLength({ min: 10, max: 10 }),
    body("loginPw").optional().isString().isLength({ min: 8, max: 32 }),
    (req: Request, res: Response) => {
        userService.updateProfile(req, res);
    }
);

userRouter.post(
    PATH_USERS + "/passwords",
    jwtMiddleware.jwtMiddleWare,
    (req: Request, res: Response) => {
        userService.checkPassword(req, res);
    }
);

// 사용자 주소 목록 조회
userRouter.get(
    PATH_USERS + "/addresses",
    jwtMiddleware.jwtMiddleWare,
    (req: Request, res: Response) => {
        userService.getUserAddresses(req, res);
    }
);

// 사용자 주소 추가
userRouter.post(
    PATH_USERS + "/addresses",
    jwtMiddleware.jwtMiddleWare,
    body("address")
        .exists({ values: "null" })
        .isString()
        .isLength({ max: 1024 }),
    body("extraAddr")
        .exists({ values: "null" })
        .isString()
        .isLength({ max: 1024 }),
    body("isDefault").exists({ values: "null" }).isBoolean(),
    (req: Request, res: Response) => {
        userService.addUserAddress(req, res);
    }
);

// 사용자 주소 기본 주소 수정
userRouter.patch(
    PATH_USERS + "/addresses/:addressId",
    jwtMiddleware.jwtMiddleWare,
    param("addressId").exists({ values: "null" }).isString().isMongoId(),
    (req: Request, res: Response) => {
        userService.updateUserDefaultAddress(req, res);
    }
);

export default userRouter;
