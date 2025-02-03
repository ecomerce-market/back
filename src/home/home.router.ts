import { Router, Request, Response } from "express";

const homeRouter: Router = Router();

// exam route
// swagger-jsDoc를 사용한 swagger API 문서화
/**
 * @openapi
 * /:
 *   get:
 *     description: Get home message
 *     responses:
 *       200:
 *         description: Returns a test message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 testMessage:
 *                   type: string
 *                   example: hello, ecommerce-service!
 */
homeRouter.get("/", (req, res) => {
    getHome(req, res);
});

// exam route handler ==> todo: MAKE SERVICE LAYER
function getHome(req: Request, res: Response) {
    return res.json({
        testMessage: "hello, ecommerce-service!",
    });
}

export default homeRouter;
