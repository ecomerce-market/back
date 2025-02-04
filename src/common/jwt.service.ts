import * as jwt from "jsonwebtoken";

class JwtService {
    readonly secret: string;
    constructor() {
        this.secret = Buffer.from(
            process.env.JWT_SECRET as string,
            "base64url"
        ).toString("utf8");
    }
    writeToken(payload: object): string {
        const token = jwt.sign(payload, this.secret, {
            expiresIn: "1h",
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
