import { Request, Response } from "express";
import productRepository from "./repository/product.repository";
import productCategoryRepository from "./repository/productCategory.repository";

class ProductService {
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
        const categoryReqParam: ProductReqDto.GetCategoryParam = req.query;
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
