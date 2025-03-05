export interface UserSignUpReqDto {
    loginId: string;
    loginPw: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    extraAddr: string;
    birth: string;
}

export interface UserSignInReqDto {
    loginId: string;
    loginPw: string;
}

export interface UserCheckPasswordReqDto {
    loginPw: string;
}

export interface UserUpdateProfileReqDto {
    loginPw?: string;
    name?: string;
    email?: string;
    phone?: string;
    birth?: string;
}

export interface UserAddressReqDto {
    address: string;
    extraAddr: string;
    isDefault: boolean;
}
