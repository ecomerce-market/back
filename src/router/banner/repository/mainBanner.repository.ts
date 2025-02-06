import { mainBannerModel } from "../model/mainBanner.schema";

class MainBannerRepository {
    async findAll() {
        return mainBannerModel
            .find()
            .where({
                deleteAt: { $eq: null },
                startAt: { $lte: new Date() },
                endAt: { $gte: new Date() },
            })
            .sort({
                displayOrder: 1,
            });
    }
}

const mainBannerRepository = new MainBannerRepository();
export default mainBannerRepository;
