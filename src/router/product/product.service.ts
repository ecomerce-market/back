import {
    GetCategoryParamDto,
    GetEndingSoonParamDto,
    GetProductDto,
    ProductSortType,
} from "./dto/product.req.dto";
import { Request, Response } from "express";
import productRepository from "./repository/product.repository";
import productCategoryRepository from "./repository/productCategory.repository";
import { ProductModel } from "./model/product.schema";
import userRepository from "../../router/user/repository/user.repository";
import { userModel } from "../user/model/user.schema";
import * as mongoose from "mongoose";
import {
    EndingSoonProductResDto,
    EndingSoonResDto,
    NewProductsResDto,
    ProductPreviewResDto,
    ProductsResDto,
    WeekendDealsResDto,
} from "./dto/product.res.dto";
import { ResDto } from "../../common/dto/common.res.dto";
import { ErrorDto } from "../../common/dto/error.res.dto";
import { ERRCODE } from "../../common/constants/errorCode.constants";

class ProductService {
    // 상품 좋아요
    async likeProduct(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.headers["X-Request-user-id"] as string;
        const productId = req.params.productId;
        if (!productId) {
            return new ErrorDto(ERRCODE.E101);
        }

        const user: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userWithInven = await userModel.populate(user, {
            path: "inventory",
        });

        try {
            const product: any =
                await productRepository.getProductById(productId);

            if (!product) {
                return new ErrorDto(ERRCODE.E102);
            }

            if (!userWithInven.inventory.likeProducts) {
                userWithInven.inventory.likeProducts = [];
            }

            if (
                userWithInven.inventory.likeProducts.some(
                    (likeProduct: any) =>
                        likeProduct.product?.toString() === productId || // optional chaining 추가
                        likeProduct.product === productId // 문자열 직접 비교도 추가
                )
            ) {
                return new ErrorDto(ERRCODE.E103);
            } else {
                userWithInven.inventory.likeProducts.push({
                    product: productId,
                    createAt: new Date(),
                });
                await userWithInven.inventory.save();
                product.likeCnt += 1;
                productRepository.updateOne(product);
                return new ResDto({ message: "like success" });
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
            }
            return new ErrorDto(ERRCODE.E999);
        }
    }

    // 상품 좋아요 취소
    async unlikeProduct(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.headers["X-Request-user-id"] as string;
        const productId = req.params.productId;
        if (!productId) {
            return new ErrorDto(ERRCODE.E101);
        }

        const user: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userWithInven = await userModel.populate(user, {
            path: "inventory",
        });

        try {
            const product: any =
                await productRepository.getProductById(productId);

            if (!product) {
                return new ErrorDto(ERRCODE.E102);
            }

            if (!userWithInven.inventory.likeProducts) {
                userWithInven.inventory.likeProducts = [];
            }

            if (
                userWithInven.inventory.likeProducts.some(
                    (likeProduct: any) =>
                        likeProduct.product?.toString() === productId || // optional chaining 추가
                        likeProduct.product === productId // 문자열 직접 비교도 추가
                )
            ) {
                userWithInven.inventory.likeProducts =
                    userWithInven.inventory.likeProducts.filter(
                        (likeProduct: any) =>
                            likeProduct.product?.toString() !== productId
                    );
                await userWithInven.inventory.save();
                product.likeCnt -= 1;
                productRepository.updateOne(product);

                return new ResDto({ message: "unlike success" });
            } else {
                return new ErrorDto(ERRCODE.E104);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
            }
            return new ErrorDto(ERRCODE.E999);
        }
    }

    // 상품 목록 조회
    async getProducts(req: Request, res: Response): Promise<ResDto> {
        const reqParam: GetProductDto = new GetProductDto(
            Number(req.query.pageSize),
            Number(req.query.pageNumber),
            String(req.query.categoryId),
            String(req.query.sort),
            String(req.query.name)
        );

        const { products, totalItems } =
            await productRepository.getProducts(reqParam);

        const productDto: Array<ProductPreviewResDto> = [];

        products.forEach((product) => {
            productDto.push(new ProductPreviewResDto(product));
        });

        const resDto: ProductsResDto = {
            products: productDto,
            totalItems,
            totalPages: Math.ceil(totalItems / reqParam.pageSize),
            currItem: productDto.length,
            currPage: reqParam.pageNumber,
        };

        return new ResDto({ data: resDto });
    }

    // 상품 상세 조회
    async getProductDetail(req: Request, res: Response): Promise<ResDto> {
        const loginId = req.headers["X-Request-user-id"]
            ? (req.headers["X-Request-user-id"] as string)
            : null;

        let liked: Promise<boolean> = Promise.resolve(false);
        if (loginId) {
            liked = this.checkLikedProduct(loginId, req.params.productId);
        }

        const productId = req.params.productId;
        if (!productId) {
            return new ErrorDto(ERRCODE.E101);
        }

        try {
            const product: any =
                await productRepository.getProductById(productId);

            const productWithCategories: any = await ProductModel.populate(
                product,
                {
                    path: "categories",
                }
            );

            const productWithCategories_doc = productWithCategories._doc;

            const { _id, __v, ...rest } = productWithCategories_doc;

            // product는 가지고 있는 컬럼이 많으므로 _id컬럼만 productId로 변경 후 반환
            const productDto = {
                productId: _id,
                ...rest,
                myLiked: await liked, // 내 좋아요 여부
            };

            if (!product) {
                return new ErrorDto(ERRCODE.E102);
            }

            return new ResDto({ data: { product: productDto } });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
            }
            return new ErrorDto(ERRCODE.E999);
        }
    }

    // 주말 할인 특가 상품 목록 조회
    async getWeekendDeals(req: Request, res: Response): Promise<ResDto> {
        const pageSize = Number(req.query.pageSize) || 10;
        const pageNumber = Number(req.query.pageNumber) || 1;
        const products: Array<any> =
            await productRepository.getWeekendDealProducts(
                new Date(),
                pageSize,
                pageNumber
            );

        const productDto: Array<ProductPreviewResDto> = [];

        products.forEach((product) => {
            productDto.push(new ProductPreviewResDto(product));
        });

        const resDto: WeekendDealsResDto = {
            endDate: this.getWeekendDealDate(),
            products: productDto,
        };

        return new ResDto({ data: resDto });
    }

    // 마감 임박 상품 목록 조회
    async getEndingSoon(req: Request, res: Response): Promise<ResDto> {
        const queries = new GetEndingSoonParamDto(
            Number(req.query.pageSize),
            Number(req.query.pageOffset)
        );

        const products: Array<any> =
            await productRepository.getEndingSoonProducts(
                queries.pageSize,
                queries.pageNumber
            );

        const productDto: Array<EndingSoonProductResDto> = [];

        products.forEach((product) => {
            productDto.push({
                productId: product._id,
                name: product.productName,
                orgPrice: product.orgPrice,
                finalPrice: product.finalPrice,
                commentCnt: product.commentCnt,
                mainImgUrl: product.mainImgUrl,
                discount: {
                    discountAmount: product.discount.discountAmount,
                    discountType: product.discount.discountType,
                },
                createAt: product.createAt,
                expirationDate: product.info.expirationDate,
            });
        });

        const resDto: EndingSoonResDto = {
            products: productDto,
        };

        return new ResDto({ data: resDto });
    }

    // 신상품 목록 조회
    async getNewProducts(req: Request, res: Response): Promise<ResDto> {
        const pageSize = Number(req.query.pageSize) || 10;
        const pageNumber = Number(req.query.pageNumber) || 1;
        const products: Array<any> = await productRepository.getNewProducts(
            pageSize,
            pageNumber
        );

        const productDto: Array<ProductPreviewResDto> = [];

        products.forEach((product) => {
            productDto.push(new ProductPreviewResDto(product));
        });

        const resDto: NewProductsResDto = {
            products: productDto,
        };

        return new ResDto({ data: resDto });
    }

    // 주말 할인 특가 마감일 계산
    getWeekendDealDate(): Date {
        const now = new Date();

        const today = now.getDay();

        const daysUntilSunday = today === 0 ? 0 : 7 - today;

        const sunday = new Date(now);
        sunday.setDate(now.getDate() + daysUntilSunday);
        sunday.setHours(23, 59, 59, 999);

        return sunday;
    }

    // 상품에 대한 카테고리 조회
    async getCategories(req: Request, res: Response): Promise<ResDto> {
        const categoryReqParam: GetCategoryParamDto = req.query;

        const categories: Array<any> =
            await productCategoryRepository.getCategories(categoryReqParam);

        const categoriesWithPath = await Promise.all(
            categories.map((category) => this.transformCategory(category))
        );

        return new ResDto({ data: { categories: categoriesWithPath } });
    }

    // 내가 좋아요를 누른 상품인지 확인
    private async checkLikedProduct(
        loginId: string,
        productId: string
    ): Promise<boolean> {
        const user: any =
            await userRepository.findByLoginIdAndDeleteAtNull(loginId);
        const userWithInven = await userModel.populate(user, {
            path: "inventory",
        });
        return (userWithInven.inventory.likeProducts as Array<any>).some(
            (likeProduct: any) =>
                likeProduct.product?.toString() === productId || // optional chaining 추가
                likeProduct.product === productId // 문자열 직접 비교도 추가
        );
    }

    // 카테고리를 fullpath와 함께 트리 구조로 변환
    private async transformCategory(category: any): Promise<any> {
        const categoryChild: Array<any> = category.childCategories;
        if (
            categoryChild.length > 0 &&
            categoryChild.some((category) => "depth" in category)
        ) {
            return {
                _id: category._id,
                name: category.name,
                depth: category.depth,
                fullPath: await this.buildFullPath(category),
                childCategories: await Promise.all(
                    category.childCategories.map((child: any) =>
                        this.transformCategory(child)
                    )
                ),
            };
        } else {
            return {
                _id: category._id,
                name: category.name,
                depth: category.depth,
                fullPath: await this.buildFullPath(category),
            };
        }
    }

    // 카테고리의 전체 경로를 구성
    private async buildFullPath(category: any): Promise<string> {
        if (!category.parentCategory) {
            return category.name;
        }
        return `${category.parentCategory.name}>${category.name}`;
    }
}

export default ProductService;
