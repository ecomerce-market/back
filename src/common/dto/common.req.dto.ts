export class PageQueryParam {
    pageSize: number;
    pageNumber: number;

    constructor(pageSize?: number, pageNumber?: number) {
        this.pageSize = !Number.isNaN(pageSize) ? (pageSize ?? 10) : 10; // null 병합 연산자 pageSize ?? 10;  // null 병합 연산자
        this.pageNumber = !Number.isNaN(pageNumber) ? (pageNumber ?? 1) : 1;
    }
}
