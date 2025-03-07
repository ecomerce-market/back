import {
    UserInventory,
    userInventoryModel,
} from "./model/userInventory.schema";
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
import {
    CartItem,
    UserCartAddReqDto,
    UserCartDeleteParam,
} from "./dto/userCart.req.dto";
import productRepository from "../../router/product/repository/product.repository";
import { CartResDto, CartResItem } from "./dto/userCart.res.dto";

class UserService {
    constructor() {}

    async getUserCoupons(req: Request, res: Response) {
        const { user } = await this.getUserByHeader(req);

        if (!user) {
            return new ErrorDto(ERRCODE.E002);
        }

        const userInventory: UserInventory =
            await userInventoryRepository.findById(user.inventory);

        const invenWithCoupons: any = await userInventoryModel.populate(
            userInventory,
            {
                path: "coupons.coupon",
                model: "coupon",
            }
        );

        if (!invenWithCoupons.coupons) {
            invenWithCoupons.coupons = [];
        }

        const coupons: Array<any> = invenWithCoupons.coupons.filter(
            (coupon: any) => !coupon.useAt
        );

        return new ResDto({ data: { coupons } });
    }
    async getUserCarts(req: Request, res: Response): Promise<ResDto> {
        const { user } = await this.getUserByHeader(req);
        if (!user) {
            return new ErrorDto(ERRCODE.E002);
        }

        const userInventory: UserInventory =
            await userInventoryRepository.findById(user.inventory);

        if (!userInventory.carts) {
            userInventory.carts = [];
        }

        const cartResDto: Array<CartResItem> = userInventory.carts.map(
            (cart) => new CartResItem(cart)
        );
        // const cartResDto: Array<CartResItem> = userInventory.carts;
        const productIds: Array<string> = cartResDto.map(
            (resDto) => resDto.productId
        );

        const productEntities: Array<any> =
            await productRepository.findProductByIdsForOrder(productIds);

        for (const cart of cartResDto) {
            const productEntity = productEntities.find((entity) => {
                return (entity._id as mongoose.Types.ObjectId).equals(
                    cart.productId
                );
            });

            if (productEntity) {
                cart.productName = productEntity.productName;
                cart.orgPrice = productEntity.orgPrice;
                cart.finalPrice = productEntity.finalPrice;
                cart.deliveryInfo = productEntity.info.deliveryInfo;
                cart.deliveryFee = productEntity.deliveryFee ?? 0; // 배송비 속성 없으면 0원
                cart.mainImgUrl = productEntity.mainImgUrl;

                if (cart.optionName) {
                    const productOption: any = productEntity.options.find(
                        (option: any) => option.optName === cart.optionName
                    );

                    if (productOption.optOrgPrice === 0) {
                        cart.orgPrice =
                            productEntity.orgPrice +
                            productOption.additionalPrice;
                    } else {
                        cart.orgPrice =
                            productOption.optOrgPrice +
                            productOption.additionalPrice;
                    }
                }
            }
        }

        const resDto: CartResDto = {
            carts: cartResDto,
            totalPrice: cartResDto.reduce(
                (acc, cur) => acc + cur.amount * cur.orgPrice,
                0
            ),
            totalDeliveryFee: cartResDto.reduce(
                (acc, cur) => acc + cur.deliveryFee,
                0
            ),
            totalDiscountPrice: 0,
            finalPrice: cartResDto.reduce(
                (acc, cur) => acc + cur.amount * cur.finalPrice,
                0
            ),
        };
        resDto.finalPrice = resDto.finalPrice + resDto.totalDeliveryFee;
        resDto.totalDiscountPrice =
            resDto.totalPrice - resDto.finalPrice - resDto.totalDeliveryFee;

        return new ResDto({
            data: { ...resDto },
        });
    }

    @validateRequest
    async addUserCart(req: Request, res: Response): Promise<ResDto> {
        const { user } = await this.getUserByHeader(req);
        if (!user) {
            return new ErrorDto(ERRCODE.E002);
        }

        const reqDto: UserCartAddReqDto = new UserCartAddReqDto(req);
        const userInventory: UserInventory =
            await userInventoryRepository.findById(user.inventory);
        if (!userInventory.carts) {
            userInventory.carts = [];
        }

        const productEntities: Array<any> =
            await productRepository.findProductByIdsForOrder(
                reqDto.products.map((product) => product.productId)
            );

        for (const productRequest of reqDto.products) {
            // 상품이 실제 존재하는 상품인지 확인
            const productEntity = productEntities.find((entity) => {
                if (productRequest.optionName) {
                    return (
                        entity._id.toString() ===
                            productRequest.productId.toString() &&
                        entity.options.find(
                            (option: any) =>
                                option.optName === productRequest.optionName
                        )
                    );
                } else {
                    return (
                        entity._id.toString() ===
                        productRequest.productId.toString()
                    );
                }
            });

            if (!productEntity) {
                return new ErrorDto(ERRCODE.E013);
            }

            if (productRequest.optionName) {
                // 옵션이 실제 상품에 없는 옵션인지 확인
                const option = productEntity.options.find(
                    (option: any) =>
                        option.optName === productRequest.optionName
                );

                if (!option) {
                    return new ErrorDto(ERRCODE.E014);
                }
            }

            // 카트에 이미 존재하는 상품인지 확인
            const productInCart = userInventory.carts!.find((inventoryCart) => {
                // 카트와 요청 상품 id 비교
                if (
                    inventoryCart.productId.toString() ===
                    productRequest.productId.toString()
                ) {
                    // 요청에 옵션이 포함되는 상품이면 옵션도 비교
                    if (productRequest.optionName) {
                        if (
                            inventoryCart.optionName ===
                            productRequest.optionName
                        ) {
                            return true;
                        }
                        // 옵션이 다르면 같은 상품이더라도 다른 아이템으로 인식
                        return false;
                    }

                    if (inventoryCart.optionName) {
                        // 카트에 옵션이 있으면서 요청에 옵션이 없으면 다른 아이템으로 인식
                        return false;
                    }
                    // 옵션이 없으면서 같은 상품이면 같은 아이템으로 인식
                    return true;
                }
                // 카트에 없는 경우
                return false;
            });

            if (productInCart) {
                // 이미 카트에 존재하는 상품이면 수량만 추가
                productInCart.amount += productRequest.amount;
            } else {
                // 카트에 존재하지 않는 상품이면 새로 추가
                userInventory.carts!.push({
                    productId: productEntity._id,
                    amount: productRequest.amount,
                    optionName: productRequest.optionName,
                    createAt: new Date(),
                });
            }
        }
        await userInventoryRepository.update(userInventory);

        return new ResDto({
            message: "add cart success",
            data: { carts: userInventory.carts },
        });
    }

    async clearUserCarts(req: Request, res: Response) {
        const { user } = await this.getUserByHeader(req);
        if (!user) {
            return new ErrorDto(ERRCODE.E002);
        }

        const userInventory: UserInventory =
            await userInventoryRepository.findById(user.inventory);

        userInventory.carts = [];

        await userInventoryRepository.update(userInventory);

        return new ResDto({
            message: "delete all carts success",
            data: { carts: userInventory.carts },
        });
    }

    @validateRequest
    async deleteUserCart(req: Request, res: Response): Promise<ResDto> {
        const { user } = await this.getUserByHeader(req);
        if (!user) {
            return new ErrorDto(ERRCODE.E002);
        }

        const productId: string = req.params.productId;
        const param: UserCartDeleteParam = new UserCartDeleteParam(req);

        const userInventory: UserInventory =
            await userInventoryRepository.findById(user.inventory);

        if (!userInventory.carts) {
            userInventory.carts = [];
        }

        const targetProduct = userInventory.carts.find((cart) => {
            if (param.optionName) {
                return (
                    cart.productId.toString() === productId &&
                    cart.optionName === param.optionName
                );
            } else if (cart.optionName) {
                return false;
            }
            return cart.productId.toString() === productId;
        });

        if (!targetProduct) {
            // todo: 에러 코드 추가
            return new ErrorDto(ERRCODE.E015);
        }

        if (param.amount) {
            targetProduct.amount -= param.amount;
            if (targetProduct.amount <= 0) {
                userInventory.carts = userInventory.carts.filter(
                    (cart) => cart !== targetProduct
                );
            }
        } else {
            userInventory.carts = userInventory.carts.filter(
                (cart) => cart !== targetProduct
            );
        }

        await userInventoryRepository.update(userInventory);

        return new ResDto({
            message: "delete success",
            data: { carts: userInventory.carts },
        });
    }

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

    async getUserByHeader(
        req: Request
    ): Promise<{ user: any; loginId: string }> {
        const loginId = req.headers["X-Request-user-id"] as string;
        const user = await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        return { user, loginId };
    }
}

const userService: UserService = new UserService();
export default userService;
