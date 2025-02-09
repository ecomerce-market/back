import * as jwt from "jsonwebtoken";

class JwtService {
    readToken(token: string): any {
        return jwt.decode(token);
    }
    readonly secret: string;
    readonly ACCESS_TOKEN_EXPIRE_IN = "1h";
    readonly REFRESH_TOKEN_EXPIRE_IN = "7d";
    constructor() {
        this.secret = Buffer.from(
            process.env.JWT_SECRET as string,
            "base64url"
        ).toString("utf8");
    }
    writeToken(payload: object) {
        const accessToken = jwt.sign(payload, this.secret, {
            expiresIn: this.ACCESS_TOKEN_EXPIRE_IN,
            algorithm: "HS512",
        });

        const refreshToken = this.writeRefreshToken(payload);
        return { accessToken, refreshToken };
    }

    private writeRefreshToken(payload: object): string {
        const token = jwt.sign(payload, this.secret, {
            expiresIn: this.REFRESH_TOKEN_EXPIRE_IN,
            algorithm: "HS512",
        });
        return token;
    }

    validateToken(token: string): boolean | Error {
        try {
            jwt.verify(token, this.secret);
            return true;
        } catch (error: any) {
            if (error instanceof Error) {
                return error;
            }
        }
        return false;
    }
}

export default new JwtService();
