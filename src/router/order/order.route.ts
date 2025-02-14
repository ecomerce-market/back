import { Router } from "express";
import jwtMiddleware from "../../middleware/jwt.middleware";
import { PATH_ORDERS } from "../../router/router.constants";
import OrderService from "./order.service";

const orderRouter = Router();

const orderService = new OrderService();

orderRouter.post(PATH_ORDERS + "/", jwtMiddleware.jwtMiddleWare, (req, res) => {
    orderService.createOrder(req, res);
});

export default orderRouter;
