import { Controller, Get, Query, Res } from "@nestjs/common"
import type { Response } from "express"
import  { ReportsService } from "./reports.service"

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("sales")
  getSalesReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getSalesReport(new Date(startDate), new Date(endDate))
  }

  @Get("commission")
  getCommissionReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getCommissionReport(new Date(startDate), new Date(endDate))
  }

  @Get("users")
  getUserReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getUserReport(new Date(startDate), new Date(endDate))
  }

  @Get("products")
  getProductReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getProductReport(new Date(startDate), new Date(endDate))
  }

  @Get("financial")
  getFinancialReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getFinancialReport(new Date(startDate), new Date(endDate))
  }

  @Get("export")
  async exportReport(
    @Query('type') type: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format = 'json',
    @Res() res: Response,
  ) {
    const data = await this.reportsService.exportReport(type, new Date(startDate), new Date(endDate), format)

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename=${type}-report.csv`)
      res.send(data)
    } else {
      res.json(data)
    }
  }
}
