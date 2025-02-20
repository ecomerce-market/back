import { Response } from "express";

export class ResDto {
    message: string;
    status: number;
    data: any;

    constructor(data: any, message?: string, status?: number) {
        this.message = message ?? "success";
        this.status = status ?? 200;
        this.data = {
            message,
            ...data,
        };
    }

    sendResponse(res: Response) {
        res.status(this.status).json(this.data);
    }
}
