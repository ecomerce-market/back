namespace ProductReqDto {}

export interface GetCategoryParam {
    id?: number;
    child?: boolean;
    name?: string;
    depth?: number;
}
export class GetEndingSoonParam {
    pageSize: number;
    pageNumber: number;

    constructor(pageSize: number, pageOffset: number) {
        this.pageSize = pageSize ?? 10;
        this.pageNumber = pageOffset ?? 1;
    }
}
