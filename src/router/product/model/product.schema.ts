import mongoose, { Schema } from "mongoose";
import { start } from "repl";

export const procuctSchema = new Schema(
    {
        productId: Schema.Types.ObjectId,
        productName: {
            type: String,
            required: true,
        },
        description: String,
        orgPrice: {
            type: Number,
            required: true,
        },
        finalPrice: {
            type: Number,
            required: true,
        },
        canReward: {
            type: Boolean,
            required: false,
            default: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 1,
        },
        likeCnt: {
            type: Number,
            default: 0,
        },
        commentCnt: {
            type: Number,
            default: 0,
        },
        sellCnt: {
            type: Number,
            default: 0,
        },
        discount: {
            discountName: String, // 할인명
            discountPer: Number, // 할인율
            discountWon: Number, // 할인금액
            startAt: Date, // 할인 시작일
            endAt: Date, // 할인 종료일
        },
        info: {
            seller: String, // 판매자
            deliveryComp: String, // 배송회사
            deliveryInfo: String, // 배송정보
            packageType: String, // 포장 타입
            packageDescription: String, // 포장 설명
            productOrigin: String, // 원산지
            extraDescription: String, // 기타 설명
        },
        options: {
            optName: String,
            optOrgPrice: Number,
            additionalPrice: Number,
            optAmount: Number,
        },
        mainImgUrl: String, // 메인 이미지
        detailInfoHtml: String, // 상세 정보 (상세 페이지 html)
        // categories: [

        // ]
    },
    {
        autoCreate: true,
        timestamps: {
            createdAt: "createAt",
            updatedAt: "updateAt",
        },
    }
);

export const ProductModel = mongoose.model("product", procuctSchema);
