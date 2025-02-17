export type OrderProduct = {
    productId: string;
    amount: number;
    optionName: string;
};

export interface OrderReqDto {
    products: Array<OrderProduct>;
}

export interface OrderUpdateDto {
    paymentMethod: PaymentMethod;
    usePoint: number;
    couponId: string;
    userAddressId: string;
}

const PAYMENT_METHOD = {
    CARD: "card",
    SIMPLE: "simple",
} as const;

export type PaymentMethod =
    (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
