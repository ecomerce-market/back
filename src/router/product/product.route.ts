import { Router } from "express";
import { PATH_PRODUCTS } from "../../router/router.constants";
import ProductService from "./product.service";
import jwtMiddleware from "../../middleware/jwt.middleware";

const productRouter: Router = Router();

const productService: ProductService = new ProductService();

// 상품 목록 조회
productRouter.get(PATH_PRODUCTS, async (req, res) => {
    const response = await productService.getProducts(req, res);
    response.sendResponse(res);
});

// 상품에 대한 카테고리 조회
productRouter.get(PATH_PRODUCTS + "/categories", async (req, res) => {
    const response = await productService.getCategories(req, res);
    response.sendResponse(res);
});

// 주말 할인 특가 상품 목록 조회
productRouter.get(PATH_PRODUCTS + "/weekend-deals", async (req, res) => {
    const response = await productService.getWeekendDeals(req, res);
    response.sendResponse(res);
});

// 마감 임박 상품 목록 조회
productRouter.get(PATH_PRODUCTS + "/ending-soon", async (req, res) => {
    const response = await productService.getEndingSoon(req, res);
    response.sendResponse(res);
});

// 신상품 목록 조회
productRouter.get(PATH_PRODUCTS + "/new-products", async (req, res) => {
    const response = await productService.getNewProducts(req, res);
    response.sendResponse(res);
});

// 상품 상세 조회
productRouter.get(
    PATH_PRODUCTS + "/:productId",
    jwtMiddleware.optionalJwtMiddleWare,
    async (req, res) => {
        const response = await productService.getProductDetail(req, res);
        response.sendResponse(res);
    }
);

// 상품의 쿠폰 다운받기
productRouter.get(
    PATH_PRODUCTS + "/:productId/coupons/:couponId",
    jwtMiddleware.optionalJwtMiddleWare,
    async (req, res) => {
        const response = await productService.getProductCoupons(req, res);
        response.sendResponse(res);
    }
);

// 상품 좋아요
productRouter.post(
    PATH_PRODUCTS + "/:productId/likes",
    jwtMiddleware.jwtMiddleWare,
    async (req, res) => {
        const response = await productService.likeProduct(req, res);
        response.sendResponse(res);
    }
);

// 상품 좋아요 취소
productRouter.delete(
    PATH_PRODUCTS + "/:productId/likes",
    jwtMiddleware.jwtMiddleWare,
    async (req, res) => {
        const response = await productService.unlikeProduct(req, res);
        response.sendResponse(res);
    }
);

export default productRouter;
