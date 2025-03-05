import { Response } from "express";

export class ResDto {
    message: string;
    status: number;
    data: any;

    constructor(instance: { data?: any; message?: string; status?: number }) {
        this.message = instance.message ?? "success";
        this.status = instance.status ?? 200;
        this.data = instance.data ?? {};
    }

    sendResponse(res: Response) {
        res.status(this.status).json({ message: this.message, ...this.data });
    }
}
