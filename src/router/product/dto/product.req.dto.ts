namespace ProductReqDto {
    export interface GetCategoryParam {
        id?: number;
        child?: boolean;
        name?: string;
        depth?: number;
    }
}
