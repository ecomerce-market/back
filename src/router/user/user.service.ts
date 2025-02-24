import { userInventoryModel } from "./model/userInventory.schema";
import { json } from "stream/consumers";
import { userModel } from "./model/user.schema";
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
import {
    UserAddressReqDto,
    UserCheckPasswordReqDto,
    UserSignInReqDto,
    UserSignUpReqDto,
    UserUpdateProfileReqDto,
} from "./dto/user.req.dto";
import {
    UserAddressesDto as UserAddressesResDto,
    UserProfileResDto,
} from "./dto/user.res.dto";
import { ResDto } from "../../common/dto/common.res.dto";
import { ErrorDto } from "../../common/dto/error.res.dto";
import { ERRCODE } from "../../common/constants/errorCode.constants";
import { validateRequest } from "../../common/decorators/validate.decorator";

class UserService {
    async getUserCarts(req: Request, res: Response): Promise<ResDto> {
        throw new Error("Method not implemented.");
    }
    async addUserCart(req: Request, res: Response): Promise<ResDto> {
        throw new Error("Method not implemented.");
    }
    async deleteUserCart(req: Request, res: Response): Promise<ResDto> {
        throw new Error("Method not implemented.");
    }
    async updateUserCart(req: Request, res: Response): Promise<ResDto> {
        throw new Error("Method not implemented.");
    }
    constructor() {}

    @validateRequest
    async deleteUserAddress(req: Request, res: Response): Promise<ResDto> {
        const loginId: string = req.headers["X-Request-user-id"] as string;

        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const addressId: string = req.params.addressId;

        const userAddress: Array<any> = await this.findUserAddresses(user);
        const targetAddress = userAddress.find((address: any) =>
            (address._id as mongoose.Types.ObjectId).equals(addressId)
        );

        if (!targetAddress) {
            return new ErrorDto(ERRCODE.E006);
        }
        if (targetAddress.defaultAddr) {
            return new ErrorDto(ERRCODE.E007);
        }

        // 삭제
        userAddressRepository.delete(targetAddress._id);
        user.addresses = userAddress.filter(
            (address) =>
                !(address._id as mongoose.Types.ObjectId).equals(addressId)
        );
        await userRepository.update(user);

        return new ResDto({
            message: "delete success",
            data: { addresses: user.addresses },
        });
    }

    @validateRequest
    async updateUserAddress(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.headers["X-Request-user-id"] as string;
        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const body: UserAddressReqDto = req.body;

        const addressId: string = req.params.addressId;

        const userFullData = await userModel.populate(user, {
            path: "addresses",
        });

        const addresses: Array<any> = await this.findUserAddresses(user);
        const targetAddress = addresses.find((address: any) =>
            (address._id as mongoose.Types.ObjectId).equals(addressId)
        );

        if (!targetAddress) {
            return new ErrorDto(ERRCODE.E006);
        }

        if (
            !body.isDefault &&
            body.isDefault === false &&
            addresses.every((address: any) => !address.defaultAddr)
        ) {
            return new ErrorDto(ERRCODE.E008);
        }

        targetAddress.address = body.address ?? targetAddress.address;
        targetAddress.extraAddress =
            body.extraAddr ?? targetAddress.extraAddress;
        targetAddress.defaultAddr = body.isDefault ?? targetAddress.defaultAddr;

        if (body.isDefault) {
            userFullData.addresses.forEach((address: any) => {
                if (
                    (address._id as mongoose.Types.ObjectId).equals(addressId)
                ) {
                    address.defaultAddr = true;
                } else {
                    address.defaultAddr = false;
                }
            });

            userAddressRepository.updateBulk(userFullData.addresses);
        }

        await userAddressRepository.update(targetAddress);
        return new ResDto({
            message: "update success",
            data: { address: targetAddress },
        });
    }

    async getUserOrders(req: Request, res: Response): Promise<ResDto> {
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
                firstProductMainImgUrl: order.products[0].productId.mainImgUrl,
                totalProductCnt: order.products.length,
                paymentMethod: order.paymentMethod,
                totalPrice: order.totalPrice,
                totalDeliveryStatus,
            };
        });

        return new ResDto({
            data: {
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
        req: Request,
        res: Response
    ): Promise<ResDto> {
        const addressId: string = req.params.addressId;

        const loginId = req.headers["X-Request-user-id"] as string;
        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userFullData = await userModel.populate(user, {
            path: "addresses",
        });

        const addresses: Array<any> = await this.findUserAddresses(user);

        const targetAddress = addresses.find((address) =>
            (address._id as mongoose.Types.ObjectId).equals(addressId)
        );
        if (!targetAddress) {
            return new ErrorDto(ERRCODE.E006);
        }

        userFullData.addresses.forEach(async (address: any) => {
            if ((address._id as mongoose.Types.ObjectId).equals(addressId)) {
                address.defaultAddr = true;
            } else {
                address.defaultAddr = false;
            }
        });

        userAddressRepository.updateBulk(userFullData.addresses);
        return new ResDto({ message: "update success" });
    }

    @validateRequest
    async addUserAddress(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.headers["X-Request-user-id"] as string;
        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        let addresses: Array<any> = await this.findUserAddresses(user);

        const body: UserAddressReqDto = req.body;

        const newAddress = new userAddressModel({
            address: body.address,
            extraAddress: body.extraAddr ?? null,
            defaultAddr: body.isDefault,
        });

        if (!Array.isArray(addresses)) {
            addresses = [];
        }

        if (body.isDefault) {
            addresses.forEach(async (address: any) => {
                if (address.defaultAddr) {
                    address.defaultAddr = false;
                    await userAddressRepository.update(address);
                }
            });
        }

        await userAddressRepository.save(newAddress);

        addresses.push(newAddress);
        user.addresses = addresses;
        await userRepository.update(user);

        return new ResDto({
            message: "new address added success",
        });
    }

    async getUserAddresses(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.headers["X-Request-user-id"] as string;
        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const addresses: Array<any> = await this.findUserAddresses(user);

        const addressDto: Array<UserAddressesResDto> = addresses
            ?.map((address: any) => {
                return new UserAddressesResDto(address);
            })
            .sort((a, b) => {
                if (a.defaultAddr) {
                    return -1;
                }
                return 1;
            });

        return new ResDto({ data: { addresses: addressDto } });
    }

    @validateRequest
    async existsUser(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.query.loginId as string;
        if (!loginId) {
            return new ErrorDto(ERRCODE.E004);
        }
        const found =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        if (!found) {
            return new ResDto({ message: "user not found" });
        } else {
            return new ErrorDto(ERRCODE.E005);
        }
    }

    @validateRequest
    async signupUser(req: Request, res: Response): Promise<ResDto> {
        const body: UserSignUpReqDto = req.body;
        const found = await userRepository.findByLoginIdOrEmailAndDeleteAtNull(
            body.loginId,
            body.email
        );

        if (found.length > 0) {
            return new ErrorDto(ERRCODE.E001);
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
        return new ResDto({});
    }

    @validateRequest
    async signinUser(req: Request, res: Response): Promise<ResDto> {
        const body: UserSignInReqDto = req.body;
        const found = await userRepository.findByLoginIdAndDeleteAtNull(
            body.loginId
        );

        if (!found) {
            return new ErrorDto(ERRCODE.E002);
        }
        if (!this.comparePassword(body.loginPw, found.loginPw)) {
            return new ErrorDto(ERRCODE.E003);
        }

        const { accessToken, refreshToken } = jwtService.writeToken({
            loginId: found.loginId,
            email: found.email,
        });

        return new ResDto({
            data: { accessToken, refreshToken, name: found.name },
        });
    }

    async getProfiles(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.headers["X-Request-user-id"] as string;

        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userFullData = await userModel.populate(user, {
            path: "inventory",
        });

        const resDto: UserProfileResDto = new UserProfileResDto(userFullData);
        return new ResDto({ data: { data: resDto } });
    }

    @validateRequest
    async checkPassword(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.headers["X-Request-user-id"] as string;

        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        const dto: UserCheckPasswordReqDto = req.body;

        if (!this.comparePassword(dto.loginPw, user.loginPw)) {
            return new ErrorDto(ERRCODE.E003);
        }
        return new ResDto({ message: "password is correct" });
    }

    @validateRequest
    async updateProfile(req: Request, res: Response): Promise<ResDto> {
        const dto: UserUpdateProfileReqDto = req.body;

        const loginId = req.headers["X-Request-user-id"] as string;

        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);

        user.name = dto.name ?? user.name;
        user.email = dto.email ?? user.email;
        user.phone = dto.phone ?? user.phone;
        user.birth = dto.birth ?? user.birth;
        if (dto.loginPw) {
            if (this.comparePassword(dto.loginPw, user.loginPw)) {
                return new ErrorDto(ERRCODE.E012);
            }

            const { hashedPassword, salt } = this.hashPassword(dto.loginPw);
            user.loginPw = hashedPassword;
        }

        await userRepository.update(user);

        return new ResDto({
            message: "update success",
            data: {
                updatedColumns: [
                    dto.name ? "name" : null,
                    dto.email ? "email" : null,
                    dto.phone ? "phone" : null,
                    dto.birth ? "birth" : null,
                    dto.loginPw ? "loginPw" : null,
                ].filter((v) => v !== null),
            },
        });
    }

    async findUserAddresses(user: any): Promise<Array<any>> {
        const userAddreeses = await userModel.populate(user, {
            path: "addresses",
        });
        return userAddreeses.addresses;
    }

    // 비밀번호 암호화
    hashPassword(password: string) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        return { hashedPassword, salt };
    }

    // 비밀번호 일치 비교
    comparePassword(rawPassword: string, hashedPassword: string) {
        return bcrypt.compareSync(rawPassword, hashedPassword);
    }
}

const userService: UserService = new UserService();
export default userService;
