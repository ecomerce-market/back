import { create } from "domain";
import { PageQueryParam } from "../../../common/dto/common.req.dto";

export interface GetCategoryParamDto {
    id?: number;
    child?: boolean;
    name?: string;
    depth?: number;
}
export class GetEndingSoonParamDto extends PageQueryParam {}

// export enum ProductSortType {
//     // 추천순
//     RECOMMEND = "recommend",
//     // 신상품순
//     NEW = "new",
//     // 판매량순
//     POPULAR = "popular",
//     // 혜택순
//     DISCOUNT = "discount",
//     // LOW_PRICE
//     LOW_PRICE = "low_price",
//     // HIGH_PRICE
//     HIGH_PRICE = "high_price",
// }

export const ProductSortKey = {
    RECOMMEND: {
        likeCnt: -1,
    },
    NEW: {
        createAt: -1,
    },
    POPULAR: {
        sellCnt: -1,
    },
    DISCOUNT: {
        discountGap: -1,
    },
    LOW_PRICE: {
        finalPrice: 1,
    },
    HIGH_PRICE: {
        finalPrice: -1,
    },
} as const;

export type ProductSortType =
    (typeof ProductSortKey)[keyof typeof ProductSortKey];

export class GetProductDto extends PageQueryParam {
    categoryId: string;
    sort: ProductSortType;

    constructor(
        pageSize: number,
        pageNumber: number,
        categoryId: string,
        sort: string
    ) {
        super(pageSize, pageNumber);
        this.categoryId = categoryId ?? null;

        this.sort = Object.keys(ProductSortKey).includes(sort)
            ? ProductSortKey[sort as keyof typeof ProductSortKey]
            : ProductSortKey.RECOMMEND;

        console.log("sort: ", this.sort);
    }
}
