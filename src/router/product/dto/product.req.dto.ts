import { PageQueryParam } from "../../../common/dto/common.req.dto";

export interface GetCategoryParamDto {
    id?: number;
    child?: boolean;
    name?: string;
    depth?: number;
}
export class GetEndingSoonParamDto extends PageQueryParam {}

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
    name: string;

    constructor(
        pageSize: number,
        pageNumber: number,
        categoryId: string,
        sort: string,
        name: string
    ) {
        super(pageSize, pageNumber);
        this.categoryId = categoryId ?? null;

        this.sort = Object.keys(ProductSortKey).includes(sort)
            ? ProductSortKey[sort as keyof typeof ProductSortKey]
            : ProductSortKey.RECOMMEND;

        this.name = name ?? null;
    }
}
