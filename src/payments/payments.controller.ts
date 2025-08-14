import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from "@nestjs/common"
import type { PaymentsService, PaymentStatus } from "./payments.service"
import type { CreatePaymentDto, PaymentFilterDto } from "./dto/payment.dto"
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard"
import { RolesGuard } from "~/common/guards/roles.guard"
import { Roles } from "~/common/decorators/roles.decorator"
import { UserRole } from "~/common/enums/role.enum"
import type { AuthenticateRequest } from "~/common/types/user.type"

@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  findAll(@Req() req: AuthenticateRequest, @Query() filterDto: PaymentFilterDto) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id
    return this.paymentsService.findAll(userId, filterDto)
  }

  @Get('stats')
  getStats(@Req() req: AuthenticateRequest) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
    return this.paymentsService.getPaymentStats(userId);
  }

  @Get(":id")
  findOne(@Req() req: AuthenticateRequest, @Param('id') id: string) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id
    return this.paymentsService.findOne(id, userId)
  }

  @Post(':id/process')
  processPayment(@Param('id') id: string) {
    return this.paymentsService.processPayment(id);
  }

  @Patch(":id/status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: PaymentStatus; gatewayReference?: string; gatewayResponse?: any },
  ) {
    return this.paymentsService.updateStatus(id, body.status, body.gatewayReference, body.gatewayResponse)
  }

  @Post(":id/refund")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  refund(@Param('id') id: string, @Body('amount') amount?: number) {
    return this.paymentsService.refund(id, amount)
  }
}
