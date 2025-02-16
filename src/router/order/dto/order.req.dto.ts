export type OrderProduct = {
    productId: string;
    amount: number;
    optionName: string;
};

export interface OrderReqDto {
    products: Array<OrderProduct>;
}
