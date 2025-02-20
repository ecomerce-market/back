export class UserProfileResDto {
    tier: string;
    name: string;
    loginId: string;
    email: string;
    phone: string;
    birth: string;
    points: number;
    couponCnt: number;

    constructor(userFullData: any) {
        this.tier = userFullData.inventory.tier ?? "기본";
        this.name = userFullData.name;
        this.loginId = userFullData.loginId;
        this.email = userFullData.email;
        this.phone = userFullData.phone;
        this.birth = userFullData.birth;
        this.points = userFullData.inventory.points;
        this.couponCnt = userFullData.inventory.coupons?.length ?? null;
    }
}

export class UserAddressesDto {
    addressId: string;
    address: string;
    extraAddr: string;
    defaultAddr: boolean;

    constructor(addressData: any) {
        this.addressId = addressData._id;
        this.address = addressData.address;
        this.extraAddr = addressData.extraAddress;
        this.defaultAddr = addressData.defaultAddr;
    }
}
