import { GetCategoryParamDto, GetProductDto } from "../dto/product.req.dto";
import { ProductModel } from "../model/product.schema";

class ProductRepository {
    async getAllProducts() {
        return ProductModel.find({
            amount: { $gt: 0 },
        });
    }
    async getProducts(reqParam: GetProductDto) {
        const query: any = {
            amount: { $gt: 0 },
        };

        if (
            reqParam.categoryId &&
            reqParam.categoryId !== "undefined" &&
            reqParam.categoryId !== "null"
        ) {
            query.categories = reqParam.categoryId;
        }

        return ProductModel.find(query)
            .sort({ createAt: -1 })
            .limit(reqParam.pageSize)
            .skip(reqParam.pageSize * (reqParam.pageNumber - 1));
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
