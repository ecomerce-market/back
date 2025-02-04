namespace UserReqDto {
    export interface UserSignUp {
        loginId: string;
        loginPw: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        extraAddr: string;
        birth: string;
    }

    export interface UserSignIn {
        loginId: string;
        loginPw: string;
    }
}
