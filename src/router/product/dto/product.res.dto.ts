export interface WeekendDealsResDto {
    endDate: Date;
    products: Array<ProductPreviewResDto>;
}

export interface EndingSoonResDto {
    products: Array<ProductPreviewResDto>;
}

export class ProductPreviewResDto {
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

    constructor(product: any) {
        this.productId = product._id;
        this.name = product.productName;
        this.orgPrice = product.orgPrice;
        this.finalPrice = product.finalPrice;
        this.commentCnt = product.commentCnt;
        this.mainImgUrl = product.mainImgUrl;
        (this.discount = {
            discountAmount: product.discount?.discountAmount,
            discountType: product.discount?.discountType,
        }),
            (this.createAt = product.createAt);
    }
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
