import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import mainBannerRepository from "./repository/mainBanner.repository";
import { MainBannerResDto } from "./dto/mainBanner.res.dto";
import { ResDto } from "../../common/dto/common.res.dto";

class BannerService {
    async getMainBanners(req: Request, res: Response): Promise<ResDto> {
        const banners = await mainBannerRepository.findAll();

        const bannerDto: Array<MainBannerResDto> = banners.map(
            (bannner) => new MainBannerResDto(bannner)
        );

        return new ResDto({ data: { banners: bannerDto } });
    }
}

const bannerService: BannerService = new BannerService();

export default bannerService;
