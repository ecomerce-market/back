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
import * as mongoose from "mongoose";
import orderRepository from "../../router/order/repository/order.repository";
import { PageQueryParam } from "../../common/dto/common.req.dto";

class UserService {
    constructor() {}

    async getUserOrders(
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
        const user: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const pageQueryParam: PageQueryParam = new PageQueryParam(
            Number(req.query.page),
            Number(req.query.size)
        );

        const myOrders = orderRepository.findByUserId(
            user._id,
            pageQueryParam.pageSize,
            pageQueryParam.pageNumber
        );

        const totalItem = orderRepository.countByUserId(user._id);

        const orderData: any = await myOrders;
        const orderDto: Array<any> = orderData.map((order: any) => {
            const allDeliveryStatus = order.products.map(
                (product: any) => product.deliveryInfo.deliveryStatus
            );

            // 종합 배송 상태 결정
            let totalDeliveryStatus = "ready"; // 기본값: 배송준비

            if (
                allDeliveryStatus.every(
                    (status: string) => status === "delivered"
                )
            ) {
                totalDeliveryStatus = "delivered"; // 모두 배송완료
            } else if (
                allDeliveryStatus.some(
                    (status: string) => status === "shipping"
                )
            ) {
                totalDeliveryStatus = "shipping"; // 하나라도 배송중
            }
            return {
                orderId: order._id,
                orderDate: order.approveAt,
                orderStatus: order.orderStatus,
                firstProductName: order.products[0].productId.productName,
                totalProductCnt: order.products.length,
                paymentMethod: order.paymentMethod,
                totalPrice: order.totalPrice,
                totalDeliveryStatus,
            };
        });

        return res.status(200).json({
            message: "success",
            data: {
                // orders: await myOrders,
                orders: orderDto,
                
                totalItems: await totalItem,
                totalPages: Math.ceil(
                    (await totalItem) / pageQueryParam.pageSize
                ),
                currPage: pageQueryParam.pageNumber,
                currItem: ((await myOrders) as Array<any>).length,
            },
        });
    }
    async updateUserDefaultAddress(
        req: Request<
            import("express-serve-static-core").ParamsDictionary,
            any,
            any,
            import("qs").ParsedQs,
            Record<string, any>
        >,
        res: Response<any, Record<string, any>>
    ) {
        const addressId: string = req.params.addressId;

        const loginId = req.headers["X-Request-user-id"] as string;
        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userFullData = await userModel.populate(user, {
            path: "addresses",
        });

        const targetAddress = (userFullData.addresses as Array<any>).find(
            (address) =>
                (address._id as mongoose.Types.ObjectId).equals(addressId)
        );
        if (!targetAddress) {
            return res.status(404).json({
                message: `address ${addressId} not found`,
                code: "E006",
            });
        }

        userFullData.addresses.forEach(async (address: any) => {
            if ((address._id as mongoose.Types.ObjectId).equals(addressId)) {
                address.defaultAddr = true;
            } else {
                address.defaultAddr = false;
            }
        });

        userAddressRepository.updateBulk(userFullData.addresses);
        return res.status(200).json({
            message: "update success",
        });
    }

    async addUserAddress(req: Request, res: Response) {
        const loginId = req.headers["X-Request-user-id"] as string;
        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userFullData = await userModel.populate(user, {
            path: "addresses",
        });

        const body: UserReqDto.UserAddress = req.body;

        const newAddress = new userAddressModel({
            address: body.address,
            extraAddress: body.extraAddr ?? null,
            defaultAddr: body.isDefault,
        });

        if (!Array.isArray(userFullData.addresses)) {
            userFullData.addresses = [];
        }

        if (body.isDefault) {
            userFullData.addresses.forEach(async (address: any) => {
                if (address.defaultAddr) {
                    address.defaultAddr = false;
                    await userAddressRepository.update(address);
                }
            });
        }

        await userAddressRepository.save(newAddress);

        userFullData.addresses.push(newAddress);
        await userRepository.update(userFullData);

        return res.status(200).json({
            message: "new address added success",
        });
    }

    async getUserAddresses(req: Request, res: Response) {
        const loginId = req.headers["X-Request-user-id"] as string;
        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userFullData = await userModel.populate(user, {
            path: "addresses",
        });

        const addresses: Array<any> = userFullData.addresses?.map(
            (address: any) => {
                return {
                    addressId: address._id,
                    address: address.address,
                    extraAddr: address.extraAddress,
                    defaultAddr: address.defaultAddr,
                };
            }
        );

        const sorted = addresses?.sort((a, b) => {
            if (a.defaultAddr) {
                return -1;
            }
            return 1;
        });

        return res.status(200).json({
            message: "success",
            addresses: sorted,
        });
    }

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
            likeProducts: [],
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

        const { accessToken, refreshToken } = jwtService.writeToken({
            loginId: found.loginId,
            email: found.email,
        });

        return res.status(200).json({
            accessToken,
            refreshToken,
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

    async checkPassword(
        req: Request<
            import("express-serve-static-core").ParamsDictionary,
            any,
            any,
            import("qs").ParsedQs,
            Record<string, any>
        >,
        res: Response<any, Record<string, any>>
    ) {
        if (validateMiddleware.validateCheck(req, res)) {
            return;
        }
        const loginId = req.headers["X-Request-user-id"] as string;

        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const dto: UserReqDto.UserCheckPassword = req.body;

        if (!this.comparePassword(dto.loginPw, user.loginPw)) {
            return res.status(400).json({
                message: "password is incorrect",
                code: "E003",
            });
        }
        return res.status(200).json({
            message: "password is correct",
        });
    }

    async updateProfile(
        req: Request<
            import("express-serve-static-core").ParamsDictionary,
            any,
            any,
            import("qs").ParsedQs,
            Record<string, any>
        >,
        res: Response<any, Record<string, any>>
    ) {
        if (validateMiddleware.validateCheck(req, res)) {
            return;
        }

        const dto: UserReqDto.UserUpdateProfile = req.body;

        const loginId = req.headers["X-Request-user-id"] as string;

        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        user.name = dto.name ?? user.name;
        user.email = dto.email ?? user.email;
        user.phone = dto.phone ?? user.phone;
        user.birth = dto.birth ?? user.birth;
        if (dto.loginPw) {
            const { hashedPassword, salt } = this.hashPassword(dto.loginPw);
            user.loginPw = hashedPassword;
        }

        await userRepository.update(user);

        return res.status(200).json({
            message: "update success",
            updatedColumns: [
                dto.name ? "name" : null,
                dto.email ? "email" : null,
                dto.phone ? "phone" : null,
                dto.birth ? "birth" : null,
                dto.loginPw ? "loginPw" : null,
            ].filter((v) => v !== null),
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
