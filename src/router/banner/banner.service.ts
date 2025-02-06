import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import mainBannerRepository from "./repository/mainBanner.repository";

class BannerService {
    async getMainBanners(
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
        res: Response<any, Record<string, any>>
    ) {
        const banners = await mainBannerRepository.findAll();
        return res.status(200).json({
            message: "success",
            banners,
        });
    }
}

const bannerService: BannerService = new BannerService();

export default bannerService;
