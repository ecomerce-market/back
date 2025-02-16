import { Router } from "express";
import jwtMiddleware from "../../middleware/jwt.middleware";
import { PATH_ORDERS } from "../../router/router.constants";
import OrderService from "./order.service";
import { body, param } from "express-validator";

const orderRouter = Router();

const orderService = new OrderService();

orderRouter.post(PATH_ORDERS + "/", jwtMiddleware.jwtMiddleWare, (req, res) => {
    orderService.createOrder(req, res);
});

orderRouter.patch(
    PATH_ORDERS + "/:orderId",
    jwtMiddleware.jwtMiddleWare,
    body("paymentMethod").optional().isString(),
    body("usePoint").optional().isNumeric(),
    body("coupon").optional().isString().isMongoId(),
    (req, res) => {
        orderService.updateOrder(req, res);
    }
);

export default orderRouter;
