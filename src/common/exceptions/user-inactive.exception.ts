import { HttpException, HttpStatus } from '@nestjs/common';

export class UserInactiveException extends HttpException {
    constructor() {
        super('User account is inactive', HttpStatus.FORBIDDEN);
    }
}
