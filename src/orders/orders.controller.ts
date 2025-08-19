import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from "@nestjs/common"
import  { OrdersService } from "./orders.service"
import type { CreateOrderDto, UpdateOrderDto, OrderFilterDto } from "./dto/order.dto"
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard"
import { RolesGuard } from "~/common/guards/roles.guard"
import { Roles } from "~/common/decorators/roles.decorator"
import { UserRole } from "~/common/enums/role.enum"
import { type OrderStatus } from "./entities/order.entity"

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, req: any) {
    return this.ordersService.create(req.user.id, createOrderDto)
  }

  @Get()
  findAll(@Query() filterDto: OrderFilterDto, req: any) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id
    return this.ordersService.findAll(userId, filterDto)
  }

  @Get("stats")
  getStats(req: any) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id
    return this.ordersService.getOrderStats(userId)
  }

  @Get(":id")
  findOne(@Param('id') id: string, req: any) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id
    return this.ordersService.findOne(id, userId)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto)
  }

  @Patch(":id/status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status)
  }

  @Patch(":id/cancel")
  cancel(@Param('id') id: string, req: any) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id
    return this.ordersService.cancel(id, userId)
  }
}
