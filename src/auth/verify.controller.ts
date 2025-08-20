import { Body, Controller, Post } from "@nestjs/common";
import { VerifyService } from "./verify.service";
import { VerifyConfirmDto, VerifyRequestDto } from "./dto/verify.dto";


@Controller("verify")
export class VerifyController {
    constructor(private readonly verifyService: VerifyService) { }

    // 🔹 Universal request endpoint
    @Post("request")
    async requestCode(@Body() dto: VerifyRequestDto) {
        return this.verifyService.requestVerify(dto.type, dto.value);
    }

    // 🔹 Universal confirm endpoint
    @Post("confirm")
    async confirmCode(@Body() dto: VerifyConfirmDto) {
        return this.verifyService.confirmVerify(dto.type, dto.value, dto.code);
    }
}