export class MainBannerResDto {
    name: string;
    imgUrl: string;
    link: string;
    endAt: Date;
    displayOrder: number;

    constructor(props: any) {
        this.name = props.name;
        this.imgUrl = props.imgUrl;
        this.link = props.link;
        this.endAt = props.endAt;
        this.displayOrder = props.displayOrder;
    }
}
