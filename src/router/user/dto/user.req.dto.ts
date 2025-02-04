type UserSignupReqDto = {
    loginId: string;
    loginPw: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    extraAddr: string;
    birth: string;
};

interface UserSignInReqDto {
    loginId: string;
    loginPw: string;
}
