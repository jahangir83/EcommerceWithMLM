import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    BadRequestException,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: any =
            exception instanceof HttpException
                ? exception.getResponse()
                : "Internal server error";

        if (exception instanceof BadRequestException) {
            status = HttpStatus.BAD_REQUEST;
            message = exception.getResponse();
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            path: request.url,
            timestamp: new Date().toISOString(),
            error: message,
        });
    }
}
