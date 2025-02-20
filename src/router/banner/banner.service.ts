import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import mainBannerRepository from "./repository/mainBanner.repository";
import { MainBannerResDto } from "./dto/mainBanner.res.dto";

class BannerService {
    async getMainBanners(req: Request, res: Response) {
        const banners = await mainBannerRepository.findAll();

        const bannerDto: Array<MainBannerResDto> = [];

        banners.forEach((banner) => {
            bannerDto.push({
                name: banner.name,
                imgUrl: banner.imgUrl,
                link: banner.link,
                endAt: banner.endAt,
                displayOrder: banner.displayOrder,
            });
        });

        return res.status(200).json({
            message: "success",
            banners: bannerDto,
        });
    }
}

const bannerService: BannerService = new BannerService();

export default bannerService;
