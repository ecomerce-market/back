export interface GetCategoryParamDto {
    id?: number;
    child?: boolean;
    name?: string;
    depth?: number;
}
export class GetEndingSoonParamDto {
    pageSize: number;
    pageNumber: number;

    constructor(pageSize: number, pageOffset: number) {
        this.pageSize = pageSize ?? 10;
        this.pageNumber = pageOffset ?? 1;
    }
}
