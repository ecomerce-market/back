import { PATH_USERS } from "./../router.constants";
import { Router, Request, Response } from "express";
import { body, param, query } from "express-validator";
import jwtMiddleware from "../../middleware/jwt.middleware";
import userService from "./user.service";

const userRouter: Router = Router();

userRouter.get(
    PATH_USERS + "/exists",
    query("loginId")
        .exists({ values: "null" })
        .isString()
        .isLength({ min: 8, max: 32 }),
    async (req: Request, res: Response) => {
        const response = await userService.existsUser(req, res);
        response.sendResponse(res);
    }
);

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
    async (req: Request, res: Response) => {
        const response = await userService.signupUser(req, res);
        response.sendResponse(res);
    }
);

userRouter.post(
    PATH_USERS + "/signin",
    body("loginId").isString().isLength({ min: 8, max: 32 }),
    body("loginPw").isString().isLength({ min: 8, max: 32 }),
    async (req: Request, res: Response) => {
        const response = await userService.signinUser(req, res);
        response.sendResponse(res);
    }
);

userRouter.get(
    PATH_USERS + "/profiles",
    jwtMiddleware.jwtMiddleWare,
    async (req: Request, res: Response) => {
        const response = await userService.getProfiles(req, res);
        response.sendResponse(res);
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
    async (req: Request, res: Response) => {
        const response = await userService.updateProfile(req, res);
        response.sendResponse(res);
    }
);

userRouter.post(
    PATH_USERS + "/passwords",
    jwtMiddleware.jwtMiddleWare,
    async (req: Request, res: Response) => {
        const response = await userService.checkPassword(req, res);
        response.sendResponse(res);
    }
);

// 사용자 주소 목록 조회
userRouter.get(
    PATH_USERS + "/addresses",
    jwtMiddleware.jwtMiddleWare,
    async (req: Request, res: Response) => {
        const response = await userService.getUserAddresses(req, res);
        response.sendResponse(res);
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
    async (req: Request, res: Response) => {
        const response = await userService.addUserAddress(req, res);
        response.sendResponse(res);
    }
);

// 사용자 주소 삭제
userRouter.delete(
    PATH_USERS + "/addresses/:addressId",
    jwtMiddleware.jwtMiddleWare,
    param("addressId").exists({ values: "null" }).isString().isMongoId(),
    async (req: Request, res: Response) => {
        const response = await userService.deleteUserAddress(req, res);
        response.sendResponse(res);
    }
);

// 사용자 주소 수정
userRouter.patch(
    PATH_USERS + "/addresses/:addressId",
    body("address").optional().isString().isLength({ max: 1024 }),
    body("extraAddr").optional().isString().isLength({ max: 1024 }),
    body("isDefault").optional().isBoolean(),
    jwtMiddleware.jwtMiddleWare,
    async (req: Request, res: Response) => {
        const response = await userService.updateUserAddress(req, res);
        response.sendResponse(res);
    }
);

// 사용자 주소 기본 주소 수정
userRouter.patch(
    PATH_USERS + "/addresses/:addressId/defaults",
    jwtMiddleware.jwtMiddleWare,
    param("addressId").exists({ values: "null" }).isString().isMongoId(),
    async (req: Request, res: Response) => {
        const response = await userService.updateUserDefaultAddress(req, res);
        response.sendResponse(res);
    }
);

// 내 주문 조회
userRouter.get(
    PATH_USERS + "/orders",
    jwtMiddleware.jwtMiddleWare,
    async (req: Request, res: Response) => {
        const response = await userService.getUserOrders(req, res);
        response.sendResponse(res);
    }
);

// 내 장바구니 조회
userRouter.get(
    PATH_USERS + "/carts",
    jwtMiddleware.jwtMiddleWare,
    async (req: Request, res: Response) => {
        const response = await userService.getUserCarts(req, res);
        response.sendResponse(res);
    }
);

// 내 장바구니 상품 추가
userRouter.post(
    PATH_USERS + "/carts",
    jwtMiddleware.jwtMiddleWare,
    body("products").exists({ values: "null" }).isArray(),
    body("products.*.productId")
        .exists({ values: "null" })
        .isString()
        .isMongoId(),
    body("products.*.amount")
        .exists({ values: "null" })
        .isNumeric()
        .isInt({ min: 1 }),
    body("products.*.optionName").optional().isString(),
    async (req: Request, res: Response) => {
        const response = await userService.addUserCart(req, res);
        response.sendResponse(res);
    }
);

// 내 장바구니 상품 삭제
userRouter.delete(
    PATH_USERS + "/carts/:productId",
    jwtMiddleware.jwtMiddleWare,
    param("productId").exists({ values: "null" }).isString().isMongoId(),
    query("amount").optional().isNumeric().isInt({ min: 1 }),
    query("optionName").optional().isString(),
    async (req: Request, res: Response) => {
        const response = await userService.deleteUserCart(req, res);
        response.sendResponse(res);
    }
);

// 내 장바구니 수정
userRouter.patch(
    PATH_USERS + "/carts",
    jwtMiddleware.jwtMiddleWare,
    async (req: Request, res: Response) => {
        const response = await userService.updateUserCart(req, res);
        response.sendResponse(res);
    }
);

export default userRouter;
