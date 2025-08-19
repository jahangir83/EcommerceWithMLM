import { Injectable } from "@nestjs/common"
import  { FinancialOrchestratorService } from "~/transactions/services/financial-orchestrator.service"
import  { SubscriptionBillingService } from "./subscription-billing.service"
import  { InventoryService } from "./inventory.service"

@Injectable()
export class CronService {
  constructor(
    private financialOrchestrator: FinancialOrchestratorService,
    private subscriptionBilling: SubscriptionBillingService,
    private inventoryService: InventoryService,
  ) {}

  async runHourlyJobs() {
    console.log("[CRON] Running hourly jobs...")

    try {
      // Process pending commissions
      const commissionResults = await this.financialOrchestrator.processPendingCommissions(100)
      console.log("[CRON] Commission processing:", commissionResults)
    } catch (error) {
      console.error("[CRON] Commission processing failed:", error)
    }
  }

  async runDailyJobs() {
    console.log("[CRON] Running daily jobs...")

    try {
      // Process subscription billing
      const billingResults = await this.subscriptionBilling.processRecurringBilling()
      console.log("[CRON] Subscription billing:", billingResults)

      // Generate inventory alerts
      const lowStockProducts = await this.inventoryService.getLowStockProducts(10)
      if (lowStockProducts.length > 0) {
        console.log(`[CRON] Low stock alert: ${lowStockProducts.length} products need restocking`)
      }
    } catch (error) {
      console.error("[CRON] Daily jobs failed:", error)
    }
  }

  async runWeeklyJobs() {
    console.log("[CRON] Running weekly jobs...")

    try {
      // Generate financial reports
      const financialSummary = await this.financialOrchestrator.getFinancialSummary()
      console.log("[CRON] Weekly financial summary:", financialSummary)
    } catch (error) {
      console.error("[CRON] Weekly jobs failed:", error)
    }
  }
}
