export interface WeekendDealsResDto {
    endDate: Date;
    products: Array<ProductPreviewResDto>;
}

export interface EndingSoonResDto {
    products: Array<ProductPreviewResDto>;
}

export interface ProductPreviewResDto {
    productId: string;
    name: string;
    orgPrice: number;
    finalPrice: number;
    commentCnt: number;
    mainImgUrl: string;
    discount: {
        discountAmount: number;
        discountType: string;
    };
    createAt: Date;
}

export type EndingSoonProductResDto = ProductPreviewResDto & {
    expirationDate: Date;
};

export interface ProductsResDto {
    products: Array<ProductPreviewResDto>;
    totalPages: number;
    totalItems: number;
    currPage: number;
    currItem: number;
}

export interface NewProductsResDto {
    products: Array<ProductPreviewResDto>;
}
