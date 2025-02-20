import { ResDto } from "../../common/dto/common.res.dto";
import validateMiddleware from "../../middleware/validate.middleware";
import { Request, Response } from "express";

type ServiceMethod = (req: Request, res: Response) => Promise<ResDto> | ResDto;

export function validateRequest(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = function (req: Request, res: Response) {
        const validateError = validateMiddleware.validateCheck(req, res);
        if (validateError) {
            return validateError;
        }
        return originalMethod.call(this, req, res);
    };

    return descriptor;
}

/**
 * 설명:
데코레이터는 메서드 실행 전에 검증 로직을 수행
검증 실패 시 즉시 ErrorDto 반환
검증 성공 시 원래 메서드 실행
비동기 메서드도 처리 가능
 */
