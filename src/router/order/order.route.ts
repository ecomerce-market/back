import { Router } from "express";
import jwtMiddleware from "../../middleware/jwt.middleware";
import { PATH_ORDERS } from "../../router/router.constants";
import OrderService from "./order.service";
import { body, param } from "express-validator";

const orderRouter = Router();

const orderService = new OrderService();

// 주문서 생성
orderRouter.post(
    PATH_ORDERS + "/",
    jwtMiddleware.jwtMiddleWare,
    async (req, res) => {
        const response = await orderService.createOrder(req, res);
        response.sendResponse(res);
    }
);

// 주문서 수정 (쿠폰 사용, 포인트 사용, 결제수단 변경, 배송지 변경)
orderRouter.patch(
    PATH_ORDERS + "/:orderId",
    jwtMiddleware.jwtMiddleWare,
    body("paymentMethod").optional().isString(),
    body("usePoint").optional().isNumeric(),
    body("coupon").optional(),
    body("userAddressInfo").optional().isString().isMongoId(),
    async (req, res) => {
        const response = await orderService.updateOrder(req, res);
        response.sendResponse(res);
    }
);

// 주문서 상세 조회 (최종 가격 계산)
orderRouter.get(
    PATH_ORDERS + "/:orderId",
    jwtMiddleware.jwtMiddleWare,
    param("orderId").isMongoId(),
    async (req, res) => {
        const response = await orderService.getOrderDetail(req, res);
        response.sendResponse(res);
    }
);

// 주문서 결제 승인 요청
orderRouter.post(
    PATH_ORDERS + "/:orderId/approve",
    jwtMiddleware.jwtMiddleWare,
    param("orderId").isMongoId(),
    body("uuid")
        .isString()
        .exists({ values: "null" })
        .isLength({ min: 36, max: 36 }),
    async (req, res) => {
        const response = await orderService.approveOrder(req, res);
        response.sendResponse(res);
    }
);

export default orderRouter;
