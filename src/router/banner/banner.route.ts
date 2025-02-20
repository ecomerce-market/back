import { Request, Response, Router } from "express";
import { PATH_BANNERS } from "../../router/router.constants";
import bannerService from "./banner.service";

const bannerRouter: Router = Router();

bannerRouter.get(PATH_BANNERS, async (req: Request, res: Response) => {
    const response = await bannerService.getMainBanners(req, res);
    response.sendResponse(res);
});

export default bannerRouter;
