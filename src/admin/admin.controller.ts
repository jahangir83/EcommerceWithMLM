import { Controller, Get, Post, UseGuards } from "@nestjs/common"
import { AdminService } from "./admin.service"
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard"
import { RolesGuard } from "~/common/guards/roles.guard"
import { Roles } from "~/common/decorators/roles.decorator"
import { UserRole } from "~/common/enums/role.enum"
import { FinancialOrchestratorService } from "~/transactions/services/financial-orchestrator.service"

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly financialOrchestrator: FinancialOrchestratorService,
  ) {}

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

  @Get("financial/summary")
  async getFinancialSummary(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.financialOrchestrator.getFinancialSummary(start, end)
  }

  @Post("financial/process-commissions")
  async processPendingCommissions(limit?: string) {
    return this.financialOrchestrator.processPendingCommissions(limit ? Number.parseInt(limit) : 100)
  }

  @Post("payments/:paymentId/process-financial")
  async processPaymentFinancials(paymentId: string) {
    return this.financialOrchestrator.processOrderPayment(paymentId)
  }
}
