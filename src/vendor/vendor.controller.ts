import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from "@nestjs/common"
import  { VendorService } from "./vendor.service"
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard"
import { RolesGuard } from "~/common/guards/roles.guard"
import { Roles } from "~/common/decorators/roles.decorator"
import { UserRole } from "~/common/enums/role.enum"
import type { AuthenticateRequest } from "~/common/types/user.type"
import { OrderStatus } from "~/orders/entities/order.entity"


@Controller("vendor")
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post("become-vendor")
  becomeVendor(req: AuthenticateRequest, @Body() vendorData: any) {
    return this.vendorService.becomeVendor(req.user.id, vendorData)
  }

  @Get("dashboard")
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  getDashboard(req: AuthenticateRequest) {
    return this.vendorService.getVendorDashboard(req.user.id)
  }

  @Get("products")
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  getProducts(req: AuthenticateRequest, @Query() filterDto: any) {
    return this.vendorService.getVendorProducts(req.user.id, filterDto)
  }

  @Get("orders")
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  getOrders(req: AuthenticateRequest, @Query() filterDto: any) {
    return this.vendorService.getVendorOrders(req.user.id, filterDto)
  }

  @Patch("orders/:orderId/status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  updateOrderStatus(req: AuthenticateRequest, @Param('orderId') orderId: string, @Body('status') status: OrderStatus) {
    return this.vendorService.updateOrderStatus(req.user.id, orderId, status)
  }
}
