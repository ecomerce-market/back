export const ERRCODE = {
    // Validation Error
    E000: {
        status: 400,
        code: "E000",
        message: "request validation failed",
        desc: "요청 시 필수 파라미터 또는 body 유효성 검사에서 오류일 때 에러",
    },

    // Server Error
    E999: {
        message: "server error",
        code: "E999",
        status: 500,
        desc: "예외 처리되지 않았거나 기타 서버 내부 오류",
    },

    // User Error
    E001: {
        status: 400,
        code: "E001",
        message: "email or loginId already exists",
        desc: "회원가입 시 이메일 중복 체크 에러",
    },
    E002: {
        status: 404,
        code: "E002",
        message: "user not found",
        desc: "로그인 시 로그인 요청 정보로 조회 한 사용자가 존재하지 않을 때 에러",
    },
    E003: {
        status: 400,
        code: "E003",
        message: "Password is incorrect",
        desc: "요청 시 비밀번호가 틀렸을 때 에러",
    },
    E004: {
        status: 400,
        code: "E004",
        message: "loginId is required",
        desc: "요청 시 로그인 아이디가 없을 때 에러",
    },
    E005: {
        status: 400,
        code: "E005",
        message: "user exists",
        desc: "회원가입 시 사용자 아이디 중복 체크 에러",
    },
    E006: {
        status: 404,
        code: "E006",
        message: `address not found`,
        desc: "요청 시 조회 한 배송지가 없을 때 에러",
    },
    E007: {
        status: 400,
        code: "E007",
        message: "default address cannot be deleted",
        desc: "기본 배송지 삭제 시도 시 에러",
    },
    E008: {
        status: 400,
        code: "E008",
        message: "default address must exist",
        desc: "배송지 수정 시 기본배송지를 해제하는 경우 다른 기본 배송지가 존재하지 않을 때 에러",
    },
    E009: {
        status: 401,
        code: "E009",
        message: "Unauthorized",
        desc: "로그인이 필요한 서비스 요청 시 jwt 토큰이 없거나 유효하지 않을 때 에러",
    },
    E010: {
        status: 400,
        code: "E010",
        message: "name or phone is required",
        desc: "요청 시 사용자 이름 또는 휴대폰 번호가 없을 때 에러",
    },
    E011: {
        status: 400,
        code: "E011",
        message: "resetToken not found",
        desc: "비밀번호 초기화 요청 시 조회 한 resetToken이 없을 때 에러",
    },

    // Product Error
    E101: {
        status: 400,
        message: "productId is required",
        code: "E101",
        desc: "요청 시 상품 아이디가 없을 때 에러",
    },

    E102: {
        message: `product is not found`,
        code: "E102",
        status: 404,
        desc: "요청 시 조회 한 상품이 없을 때 에러",
    },
    E103: {
        message: `product is already liked`,
        code: "E103",
        status: 400,
        desc: "상품 좋아요 중복 요청 시 에러",
    },
    E104: {
        message: `product is not liked`,
        code: "E104",
        status: 400,
        desc: "이미 좋아요 한 상품의 상품 좋아요 취소 요청 시 에러",
    },

    // Order Erorr
    E201: {
        message:
            "주문서 생성 요청에 필요한 상품 목록 중 상품이 존재하지 않습니다.",
        code: "E201",
        status: 400,
        desc: "주문서 생성 요청에 필요한 상품 목록 중 상품이 존재하지 않을 때 에러",
    },

    E202: {
        message:
            "주문서 생성 요청에 필요한 상품 목록 중 상품의 옵션이 존재하지 않습니다.",
        code: "E202",
        status: 400,
        desc: "주문서 생성 요청에 필요한 상품 목록 중 상품의 옵션이 존재하지 않을 때 에러",
    },

    E203: {
        message: "주문서가 존재하지 않습니다.",
        code: "E203",
        status: 404,
        desc: "주문서 조회 시 주문서가 존재하지 않을 때 에러",
    },

    E204: {
        message: "이미 결제가 완료된 주문서입니다.",
        code: "E204",
        status: 400,
        desc: "주문서 결제 시 이미 결제가 완료된 주문서일 때 에러",
    },

    E205: {
        message: "본인의 주문서가 아닙니다.",
        code: "E205",
        status: 400,
        desc: "주문서 조회 시 본인의 주문서가 아닐 때 에러",
    },

    E206: {
        message: "결제수단이 선택되지 않았습니다.",
        code: "E206",
        status: 400,
        desc: "주문서 결제 시 결제수단이 선택되지 않았을 때 에러",
    },

    E207: {
        message: "사용 가능한 주소가 존재하지 않습니다.",
        code: "E207",
        status: 404,
        desc: "주문서 수정 요청 시 사용 가능한 주소가 존재하지 않을 때 에러",
    },

    E208: {
        message: "배송 주소가 선택되지 않았습니다.",
        code: "E208",
        status: 400,
        desc: "주문서 배송지 선택이 되지 않았을 때 에러",
    },
} as const;

export type ErrorCode = (typeof ERRCODE)[keyof typeof ERRCODE];
