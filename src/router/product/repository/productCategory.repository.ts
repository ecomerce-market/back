import { GetCategoryParam } from "../dto/product.req.dto";
import { productCategoryModel } from "../model/productCategory.schema";

class ProductCategoryRepository {
    async getCategories(categoryReqParam: GetCategoryParam): Promise<any> {
        const where: any = {};
        if (categoryReqParam.id) {
            where._id = categoryReqParam.id;
        }
        if (categoryReqParam.name) {
            where.name = categoryReqParam.name;
        }
        if (categoryReqParam.depth) {
            where.depth = categoryReqParam.depth;
        }

        const query = productCategoryModel
            .find()
            .where(where)
            .populate({
                path: "parentCategory",
                select: "name depth",
            })
            .sort({ depth: 1 });

        // 카테고리 depth가 가변적인 경우 다른 재귀적 방식이나 lookup을 사용해야 함
        if (categoryReqParam.child) {
            console.log("populate childCategories");
            query.populate({
                path: "childCategories",
                options: {
                    sort: { depth: 1 },
                },
                populate: [
                    {
                        path: "childCategories",
                        options: {
                            sort: { depth: 1 },
                        },
                    },
                    {
                        path: "parentCategory",
                        select: "name depth",
                    },
                ],
            });
        }

        return query.exec();
    }
}

const productCategoryRepository = new ProductCategoryRepository();
export default productCategoryRepository;
