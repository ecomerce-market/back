import { Request, ParamsDictionary, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";

class OrderService {
    async createOrder(
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
        res: Response<any, Record<string, any>, number>
    ) {
        
    }
}

export default OrderService;
