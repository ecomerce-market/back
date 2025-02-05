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

    export interface UserCheckPassword {
        loginPw: string;
    }

    export interface UserUpdateProfile {
        loginPw?: string;
        name?: string;
        email?: string;
        phone?: string;
        birth?: string;
    }
}
