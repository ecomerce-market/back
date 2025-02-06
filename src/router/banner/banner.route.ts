import { Request, Response, Router } from "express";
import { PATH_BANNERS } from "../../router/router.constants";
import bannerService from "./banner.service";

const bannerRouter: Router = Router();

bannerRouter.get(PATH_BANNERS, (req: Request, res: Response) => {
    bannerService.getMainBanners(req, res);
});

export default bannerRouter;
