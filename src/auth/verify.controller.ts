import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { VerifyService } from "./verify.service";
import { VerifyConfirmDto, VerifyRequestDto } from "./dto/verify.dto";
import { SmsService } from "~/services/sms.service";

@ApiTags("Verification") // Group name in Swagger UI
@Controller("verify")
export class VerifyController {
    constructor(
        private readonly verifyService: VerifyService, 
        private readonly smsService: SmsService
    ) {}

    // 🔹 Universal request endpoint
    @Post("request")
    @ApiOperation({ summary: "Request verification code (email/phone)" })
    @ApiResponse({ status: 201, description: "Verification code requested successfully" })
    @ApiResponse({ status: 400, description: "Invalid request" })
    @ApiBody({ type: VerifyRequestDto })
    async requestCode(@Body() dto: VerifyRequestDto) {
        return this.verifyService.requestVerify(dto.type, dto.value);
    }

    @Post("phone")
    @ApiOperation({ summary: "Request phone verification (OTP via SMS)" })
    @ApiResponse({ status: 201, description: "OTP sent to phone successfully" })
    @ApiResponse({ status: 400, description: "Failed to send OTP" })
    @ApiBody({ type: VerifyRequestDto })
    async phoneCode(@Body() dto: VerifyRequestDto) {
        try {
            const phoneVerify = await this.verifyService.requestVerify(dto.type, dto.value);
            const sent = await this.smsService.sendSms(phoneVerify.value, phoneVerify.code);

            if (!sent) {
                throw new BadRequestException("Failed to send SMS");
            }

            return { success: true, message: `OTP sent to your phone and your code (${phoneVerify.code})` };
        } catch (e) {
            throw new BadRequestException("Phone number verify failed!");
        }
    }

    // 🔹 Universal confirm endpoint
    @Post("confirm")
    @ApiOperation({ summary: "Confirm verification code" })
    @ApiResponse({ status: 200, description: "Verification confirmed successfully" })
    @ApiResponse({ status: 400, description: "Invalid or expired verification code" })
    @ApiBody({ type: VerifyConfirmDto })
    async confirmCode(@Body() dto: VerifyConfirmDto) {
        return this.verifyService.confirmVerify(dto.type, dto.value, dto.code);
    }
}
