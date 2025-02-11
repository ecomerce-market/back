import {
    GetCategoryParamDto,
    GetEndingSoonParamDto,
    GetProductDto,
} from "./dto/product.req.dto";
import { Request, Response } from "express";
import productRepository from "./repository/product.repository";
import productCategoryRepository from "./repository/productCategory.repository";

class ProductService {
    async getProducts(req: Request, res: Response) {
        const reqParam: GetProductDto = new GetProductDto(
            Number(req.query.pageSize),
            Number(req.query.pageNumber),
            String(req.query.categoryId)
        );

        const products: Array<any> =
            await productRepository.getProducts(reqParam);

        const productDto: Array<ProductResDto.ProductPreview> = [];

        products.forEach((product) => {
            productDto.push({
                productId: product.productId,
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

        const resDto: ProductResDto.Products = {
            products: productDto,
        };

        return res.status(200).json({
            message: "success",
            ...resDto,
        });
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
                productId: product.productId,
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
                productId: product.productId,
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
                productId: product.productId,
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
        console.log(categoryReqParam);

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
