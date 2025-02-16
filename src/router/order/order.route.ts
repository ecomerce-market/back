import { Router } from "express";
import jwtMiddleware from "../../middleware/jwt.middleware";
import { PATH_ORDERS } from "../../router/router.constants";
import OrderService from "./order.service";
import { body, param } from "express-validator";

const orderRouter = Router();

const orderService = new OrderService();

// 주문서 생성
orderRouter.post(PATH_ORDERS + "/", jwtMiddleware.jwtMiddleWare, (req, res) => {
    orderService.createOrder(req, res);
});

// 주문서 수정 (쿠폰 사용, 포인트 사용, 결제수단 변경, 배송지 변경)
orderRouter.patch(
    PATH_ORDERS + "/:orderId",
    jwtMiddleware.jwtMiddleWare,
    body("paymentMethod").optional().isString(),
    body("usePoint").optional().isNumeric(),
    body("coupon").optional().isString().isMongoId(),
    body("userAddressInfo").optional().isString().isMongoId(),
    (req, res) => {
        orderService.updateOrder(req, res);
    }
);

export default orderRouter;
