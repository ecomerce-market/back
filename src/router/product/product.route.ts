import { Router } from "express";
import { PATH_PRODUCTS } from "../../router/router.constants";
import ProductService from "./product.service";

const productRouter: Router = Router();

const productService: ProductService = new ProductService();

// 상품 목록 조회
productRouter.get(PATH_PRODUCTS, (req, res) => {
    productService.getProducts(req, res);
});

// 상품 상세 조회
productRouter.get(PATH_PRODUCTS + "/:productId", (req, res) => {
    productService.getProductDetail(req, res);
});

// 상품에 대한 카테고리 조회
productRouter.get(PATH_PRODUCTS + "/categories", (req, res) => {
    productService.getCategories(req, res);
});

// 주말 할인 특가 상품 목록 조회
productRouter.get(PATH_PRODUCTS + "/weekend-deals", (req, res) => {
    productService.getWeekendDeals(req, res);
});

// 마감 임박 상품 목록 조회
productRouter.get(PATH_PRODUCTS + "/ending-soon", (req, res) => {
    productService.getEndingSoon(req, res);
});

// 신상품 목록 조회
productRouter.get(PATH_PRODUCTS + "/new-products", (req, res) => {
    productService.getNewProducts(req, res);
});

export default productRouter;
