namespace ProductResDto {
    export interface WeekendDeals {
        endDate: Date;
        products: Array<ProductPreview>;
    }

    export interface ProductPreview {
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
    }
}
