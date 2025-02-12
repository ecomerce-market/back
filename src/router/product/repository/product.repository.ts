import {
    GetCategoryParamDto,
    GetProductDto,
    ProductSortKey,
} from "../dto/product.req.dto";
import { ProductModel } from "../model/product.schema";
import * as mongoose from "mongoose";

class ProductRepository {
    async updateOne(product: any) {
        return ProductModel.updateOne(
            {
                _id: product._id,
            },
            product
        );
    }
    async getProductById(productId: string) {
        return ProductModel.findOne({
            _id: new mongoose.Types.ObjectId(productId),
        });
    }
    async getAllProducts(query?: any) {
        const queryObj: any = query ?? {};

        queryObj.amount = { $gt: 0 };
        return ProductModel.find(queryObj);
    }
    async getProducts(reqParam: GetProductDto) {
        const query: any = {
            amount: { $gt: 0 },
        };

        const aggreateQueries: any[] = [
            {
                $match: query,
            },
            {
                $sort: reqParam.sort,
            },
            {
                $limit: reqParam.pageSize,
            },
            {
                $skip: reqParam.pageSize * (reqParam.pageNumber - 1),
            },
        ];

        if (
            reqParam.categoryId &&
            reqParam.categoryId !== "undefined" &&
            reqParam.categoryId !== "null"
        ) {
            query.categories = new mongoose.Types.ObjectId(reqParam.categoryId);
        }

        if (
            reqParam.name &&
            reqParam.name !== "undefined" &&
            reqParam.name !== "null"
        ) {
            query.productName = { $regex: reqParam.name, $options: "i" }; // 정규식 사용, 대소문자 구분 x 옵션
        }

        if (reqParam.sort === ProductSortKey.DISCOUNT) {
            // 할인율 순인 경우 질의 간 계산한 필드를 추가
            aggreateQueries.push({
                $addFields: {
                    discountGap: {
                        $subtract: ["$orgPrice", "$finalPrice"],
                    },
                },
            });
        }

        return {
            products: await ProductModel.aggregate(aggreateQueries),
            totalItems: await ProductModel.countDocuments(query),
        };
    }
    async getEndingSoonProducts(pageSize: number, pageNumber: number) {
        return ProductModel.find({
            amount: { $gt: 0 },
            "info.expirationDate": {
                $exists: true,
                $ne: null,
                $gte: new Date(),
            },
        })
            .sort({
                "info.expirationDate": 1,
                createAt: -1,
            })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1));
    }
    async getWeekendDealProducts(
        now: Date,
        pageSize: number,
        pageNumer: number
    ) {
        return ProductModel.find({
            // 할인 정보가 있는 상품
            discount: { $exists: true, $ne: null },
            // 현재 진행중인 할인
            "discount.endAt": { $gte: now },
            "discount.discountName": "주말 특가",
            // 재고가 있는 상품
            amount: { $gt: 0 },
        })
            .sort({ createAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumer - 1));
    }

    async getNewProducts(pageSize: number, pageNumber: number) {
        return ProductModel.find({
            amount: { $gt: 0 },
        })
            .sort({ createAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1));
    }
}

const productRepository: ProductRepository = new ProductRepository();
export default productRepository;
