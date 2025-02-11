namespace ProductResDto {
    export interface WeekendDeals {
        endDate: Date;
        products: Array<ProductPreview>;
    }

    export interface EndingSoon {
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
        createAt: Date;
    }

    export type EndingSoonProduct = ProductPreview & {
        expirationDate: Date;
    };

    export interface Products {
        products: Array<ProductPreview>;
        totalPages: number;
        totalItems: number;
        currPage: number;
        currItem: number;
    }

    export interface NewProducts {
        products: Array<ProductPreview>;
    }
}
