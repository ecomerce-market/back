# E-Commerce 프로젝트 (가명 마켓마켓)

## 프로젝트 소개

마켓컬리와 비슷한 서비스인 쇼핑몰의 MVP를 개발하며 협업 경험 및 FE/BE 구현 능력을 향상시키고자 1달의 기한을 두고 개발하는 목적을 두고 시작한 프로젝트입니다.<br>
프로젝트가 시작하기 직전에 사전 기획이 마무리 되어 있었으며, 총 3명(프론트엔드 2 / 백엔드 1)이 한 달 간 개발 진행 하였습니다.

### MVP 목표

- 1차 개발:
    1. 회원가입
    2. 로그인 (SNS 로그인 제외)
    3. 홈 (메인)
    4. 상품 상세보기
    5. 상품 결제 화면
    6. 주문 완료 내역
    7. 회원정보 수정
    8. 배송지관리
- 2차 개발:
    1. 아이디 / 비밀번호 찾기 -> 구현
    2. SNS 로그인 -> 미구현
    3. 필터 -> 구현
    4. 장바구니 -> 구현
    5. 찜 -> 미구현
    6. 쿠폰 -> 미구현
    7. 적립금 -> 미구현
- 3차 개발:
    1. 후기 / 후기작성
    2. 결제(Open API)
    3. 교환/환불
    4. 알림
    5. 검색

### 개발 기간

- 기획: `2025.01 ~ 2025.02` 기간 내
- 1차 개발: `2025.02.03 ~ 2025.02.21`
- 2차 개발: `2025.02.22 ~ 2025.02.28`, 일부 미 완성

### 팀원

- 팀장 가영님 @ggaong (기획 및 프론트엔드 개발)
- 팀원 태영님 @taeyoung0001 (프론트엔드 개발)
- 팀원 재한님 @terria1020 (백엔드 개발)

### 개발 스택 및 환경

- 프론트엔드:
    - Runtime: NodeJS
    - Framework: Next.js
    - Language: TypeScript
- 백엔드:
    - Runtime: NodeJS 20.11.X
    - Framework: ExpressJS
    - Database: MongoDB
    - Language: TypeScript

## 프로젝트 실행 방법
- 백엔드:
    1. npm 패키지 설치
    ```shell
    npm install
    ```
    2. .env 파일 설정 (.env.example 파일명을 .env로 변경, mongodb URI 등 환경변수 설정)
    3. npm 스크립트 실행
    ```shell
    npm run start:dev
    ```

## 프로젝트 진행 방식

프로젝트는 `figma의 화면기획서`를 보고 FE/BE가 1차/2차 개발에 맞는 기능을 각각 개발하여 API와 화면을 붙여 개발한다.<br>
git을 사용한 협업을 기본으로 하며, `일일 보고`, `매 주 월요일 오전 11시에 중간 보고`를 통하여 진행상황을 공유하고 향후 계획된 작업을 조율한다.<br>
코드 컨벤션을 통해 커밋 메시지 컨벤션을 따르도록 개발하였고, 각 기능의 개발 병합 간 `Pull Request`를 만들어서 확인 후 병합하는 것을 원칙으로 한다.<br>
<br>
협의에 의해 서비스를 런칭하거나 추후 개발 시 클라우드 서버를 사용할 수 있으나, 우선 별도의 서버는 두지 않고 로컬에서 개발하는 것으로 한다.<br>

## 회고
ExpressJS 프레임워크를 실제 프로젝트에 사용하는 것은 처음이었는데, 처음인 만큼 모르는 것이 많았던 것 같습니다.<br>
기획서를 보고 프로젝트 코드를 어떻게 작성해야 할 지 생각을 많이 했고, 이전에 진행했던 프로젝트의 패키지 구조를 많이 참고하여 비슷하게 구현하려고 했습니다.<br>
그래서 패키지 구조만 형식화 되어 있고, 어디에 클래스/인터페이스/타입을 사용할지 막 결정이 안 되었던 것 같습니다.<br>
그리고 프론트엔드 분과 많이 소통하지 못 한 것이 아쉽고, swagger문서 작성에 대한 시간이 많이 소모되었던 것도 아쉽습니다.<br>
테스트 코드를 작성하지 못 해본 것도 아쉽습니다. nodejs진영의 백엔드 개발 시 테스트코드를 작성하는 법을 학습하여 단위 테스트가 가능한 코드를 작성했으면 좋았을 것 같습니다.<br>
한 달이라는 기간 안에 모든 개발을 다 완벽하게 하지는 못 했지만, 최소한의 타입스크립트 사용, mongoose 사용 및 nodejs로 API를 개발하는 최소한의 프로세스를 경험한 것 같습니다.<br>
