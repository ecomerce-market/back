import { Router } from "express";
import { PATH_PRODUCTS } from "../../router/router.constants";
import ProductService from "./product.service";

const productRouter: Router = Router();

const productService: ProductService = new ProductService();

// 주말 할인 특가 상품 목록 조회
productRouter.get(PATH_PRODUCTS + "/weekend-deals", (req, res) => {
    productService.getWeekendDeals(req, res);
});

export default productRouter;
