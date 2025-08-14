import { Controller, Get, UseGuards } from "@nestjs/common"
import type { AdminService } from "./admin.service"
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard"
import { RolesGuard } from "~/common/guards/roles.guard"
import { Roles } from "~/common/decorators/roles.decorator"
import { UserRole } from "~/common/enums/role.enum"

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  getDashboard() {
    return this.adminService.getDashboardStats()
  }

  @Get("activities")
  getRecentActivities(limit?: number) {
    return this.adminService.getRecentActivities(limit)
  }

  @Get("stats/users")
  getUserStats() {
    return this.adminService.getUserStats()
  }

  @Get("stats/orders")
  getOrderStats() {
    return this.adminService.getOrderStats()
  }

  @Get("stats/revenue")
  getRevenueStats() {
    return this.adminService.getRevenueStats()
  }

  @Get("top-performers")
  getTopPerformers() {
    return this.adminService.getTopPerformers()
  }
}
