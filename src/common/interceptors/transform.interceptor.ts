import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request, Response } from "express";

export interface ResponseFormat<T> {
    success: boolean;
    statusCode: number;
    data: T;
    timestamp: string;
    path: string;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ResponseFormat<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<ResponseFormat<T>> {
        const ctx = context.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();

        return next.handle().pipe(
            map((data: T) => {
                // ✅ Only wrap normal success responses
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    return {
                        success: true,
                        statusCode: response.statusCode,
                        data,
                        timestamp: new Date().toISOString(),
                        path: request.url,
                    };
                }

                // ✅ Let errors go untouched (handled by AllExceptionsFilter)
                return data as any;
            }),
        );
    }
}
