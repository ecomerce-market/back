import { PageQueryParam } from "../../../common/dto/common.req.dto";

export interface GetCategoryParamDto {
    id?: number;
    child?: boolean;
    name?: string;
    depth?: number;
}
export class GetEndingSoonParamDto extends PageQueryParam {}

export class GetProductDto extends PageQueryParam {
    categoryId?: string;

    constructor(pageSize: number, pageNumber: number, categoryId: string) {
        super(pageSize, pageNumber);
        if (categoryId !== undefined && categoryId) {
            this.categoryId = categoryId;
        }
    }
}
