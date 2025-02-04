import { Model } from "mongoose";
import { couponModel } from "../model/coupon.schema";

class CouponRepository {
    async save(coupon: Model<any>) {
        return couponModel.create(coupon);
    }
}

const couponRepository: CouponRepository = new CouponRepository();
export default couponRepository;
