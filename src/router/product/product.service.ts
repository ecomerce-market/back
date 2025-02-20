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
import { userModel } from "../../router/user/model/user.scheme";
import * as mongoose from "mongoose";

class ProductService {
    async likeProduct(req: Request, res: Response) {
        const loginId = req.headers["X-Request-user-id"] as string;
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).json({
                message: "productId is required",
                code: "E101",
            });
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
                return res.status(404).json({
                    message: `product ${productId} is not found`,
                    code: "E102",
                });
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
                return res.status(400).json({
                    message: `product ${productId} is already liked`,
                    code: "E103",
                });
            } else {
                userWithInven.inventory.likeProducts.push({
                    product: productId,
                    createAt: new Date(),
                });
                await userWithInven.inventory.save();
                product.likeCnt += 1;
                productRepository.updateOne(product);
                return res.status(200).json({
                    message: "like success",
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
            }
            return res.status(500).json({
                message: "server error",
                code: "E999",
            });
        }
    }

    async unlikeProduct(req: Request, res: Response) {
        const loginId = req.headers["X-Request-user-id"] as string;
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).json({
                message: "productId is required",
                code: "E101",
            });
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
                return res.status(404).json({
                    message: `product ${productId} is not found`,
                    code: "E102",
                });
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
                return res.status(200).json({
                    message: "unlike success",
                });
            } else {
                return res.status(400).json({
                    message: `product ${productId} is not liked`,
                    code: "E104",
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
            }
            return res.status(500).json({
                message: "server error",
                code: "E999",
            });
        }
    }

    async getProducts(req: Request, res: Response) {
        const reqParam: GetProductDto = new GetProductDto(
            Number(req.query.pageSize),
            Number(req.query.pageNumber),
            String(req.query.categoryId),
            String(req.query.sort),
            String(req.query.name)
        );

        const { products, totalItems } =
            await productRepository.getProducts(reqParam);

        const productDto: Array<ProductResDto.ProductPreview> = [];

        products.forEach((product) => {
            productDto.push({
                productId: product._id,
                name: product.productName,
                orgPrice: product.orgPrice,
                finalPrice: product.finalPrice,
                commentCnt: product.commentCnt,
                mainImgUrl: product.mainImgUrl,
                discount: {
                    discountAmount: product.discount?.discountAmount,
                    discountType: product.discount?.discountType,
                },
                createAt: product.createAt,
            });
        });

        const resDto: ProductResDto.Products = {
            products: productDto,
            totalItems,
            totalPages: Math.ceil(totalItems / reqParam.pageSize),
            currItem: productDto.length,
            currPage: reqParam.pageNumber,
        };

        return res.status(200).json({
            message: "success",
            ...resDto,
        });
    }

    async getProductDetail(req: Request, res: Response) {
        const loginId = req.headers["X-Request-user-id"]
            ? (req.headers["X-Request-user-id"] as string)
            : null;

        let liked: Promise<boolean> = Promise.resolve(false);
        if (loginId) {
            liked = this.checkLikedProduct(loginId, req.params.productId);
        }

        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).json({
                message: "productId is required",
                code: "E101",
            });
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
                return res.status(404).json({
                    message: `product ${productId} is not found`,
                    code: "E102",
                });
            }

            return res.status(200).json({
                message: "success",
                product: productDto,
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
            }
            return res.status(500).json({
                message: "server error",
                code: "E999",
            });
        }
    }

    async getWeekendDeals(req: Request, res: Response) {
        const pageSize = Number(req.query.pageSize) || 10;
        const pageNumber = Number(req.query.pageNumber) || 1;
        const products: Array<any> =
            await productRepository.getWeekendDealProducts(
                new Date(),
                pageSize,
                pageNumber
            );

        const productDto: Array<ProductResDto.ProductPreview> = [];

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
            });
        });

        const resDto: ProductResDto.WeekendDeals = {
            endDate: this.getWeekendDealDate(),
            products: productDto,
        };

        return res.status(200).json({
            message: "success",
            ...resDto,
        });
    }

    async getEndingSoon(req: Request, res: Response) {
        const queries = new GetEndingSoonParamDto(
            Number(req.query.pageSize),
            Number(req.query.pageOffset)
        );

        const products: Array<any> =
            await productRepository.getEndingSoonProducts(
                queries.pageSize,
                queries.pageNumber
            );

        const productDto: Array<ProductResDto.EndingSoonProduct> = [];

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

        const resDto: ProductResDto.EndingSoon = {
            products: productDto,
        };

        return res.status(200).json({
            message: "success",
            ...resDto,
        });
    }

    async getNewProducts(req: Request, res: Response) {
        const pageSize = Number(req.query.pageSize) || 10;
        const pageNumber = Number(req.query.pageNumber) || 1;
        const products: Array<any> = await productRepository.getNewProducts(
            pageSize,
            pageNumber
        );

        const productDto: Array<ProductResDto.ProductPreview> = [];

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
            });
        });

        const resDto: ProductResDto.NewProducts = {
            products: productDto,
        };

        return res.status(200).json({
            message: "success",
            ...resDto,
        });
    }

    getWeekendDealDate(): Date {
        const now = new Date();

        const today = now.getDay();

        const daysUntilSunday = today === 0 ? 0 : 7 - today;

        const sunday = new Date(now);
        sunday.setDate(now.getDate() + daysUntilSunday);
        sunday.setHours(23, 59, 59, 999);

        return sunday;
    }

    async getCategories(req: Request, res: Response) {
        const categoryReqParam: GetCategoryParamDto = req.query;

        const categories: Array<any> =
            await productCategoryRepository.getCategories(categoryReqParam);

        const categoriesWithPath = await Promise.all(
            categories.map((category) => this.transformCategory(category))
        );

        return res.status(200).json({
            message: "success",
            categories: categoriesWithPath,
        });
    }

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

    private async buildFullPath(category: any): Promise<string> {
        if (!category.parentCategory) {
            return category.name;
        }
        return `${category.parentCategory.name}>${category.name}`;
    }
}

export default ProductService;
