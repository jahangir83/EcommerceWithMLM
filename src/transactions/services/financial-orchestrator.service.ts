import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { Repository, DataSource } from "typeorm"
import { TransactionService } from "./transaction.service"
import { PaymentsService } from "~/payments/payments.service"
import { OrdersService } from "~/orders/orders.service"

import { User, Wallet, RevenueShare } from "~/entity"
import { Order, OrderStatus } from "~/orders/entities/order.entity"
import { Payment, PaymentStatus } from "~/payments/entities/payment.entity"
import { WalletType, TransactionDirection } from "~/common/enums/common.enum"
import { FulfillmentOrchestratorService } from "~/services/fulfillment-orchestrator.service"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class FinancialOrchestratorService {

  private dataSource: DataSource;

  constructor(
    @InjectRepository(RevenueShare)
    private revenueRepo: Repository<RevenueShare>,

    private transactionService: TransactionService,
    private ordersService: OrdersService,
    private fulfillmentOrchestrator: FulfillmentOrchestratorService,
  ) {

  }

  // Main orchestration method: handles complete payment to commission flow
  async processOrderPayment(paymentId: string) {
    return this.dataSource.transaction(async (manager) => {
      // Get payment with order details
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        relations: ["order", "order.items", "order.items.product", "order.user"],
      })

      if (!payment) {
        throw new NotFoundException("Payment not found")
      }

      if (payment.status !== PaymentStatus.SUCCESS) {
        throw new BadRequestException("Payment is not successful")
      }

      const order = payment.order

      // 1. Create purchase transaction with proper journal entries
      const purchaseTransaction = await this.createPurchaseTransaction(order, manager)

      // 2. Distribute revenue shares for commission system
      const revenueShares = await this.distributeOrderRevenue(order, purchaseTransaction.id, manager)

      // 3. Update order status to processing
      await manager.update(Order, { id: order.id }, { status: OrderStatus.PROCESSING })

      // 4. Process any immediate commission payouts (optional)
      const paidCommissions = await this.processImmediateCommissions(revenueShares, manager)

      // 5. Process order fulfillment (digital delivery, shipping, etc.)
      // TODO: Avoid any
      let fulfillmentResult: any = null
      try {
        fulfillmentResult = await this.fulfillmentOrchestrator.processOrderFulfillment(order)
        console.log("[v0] Fulfillment processing completed:", fulfillmentResult)

        // Update order status based on fulfillment result
        if (fulfillmentResult.success) {
          await manager.update(Order, { id: order.id }, { status: OrderStatus.COMPLETED })
        }
      } catch (error) {
        console.error("[v0] Fulfillment processing failed:", error)
        // Don't fail the entire transaction, but log for manual processing
        fulfillmentResult = { success: false, error: error.message }
      }

      return {
        purchaseTransaction,
        revenueShares,
        paidCommissions,
        fulfillmentResult,
        order: {
          id: order.id,
          status: fulfillmentResult?.success ? OrderStatus.COMPLETED : OrderStatus.PROCESSING,
        },
      }
    })
  }

  // Create purchase transaction with proper accounting
  private async createPurchaseTransaction(order: Order, manager: any) {
    // Get or create platform revenue wallet
    const platformWallet = await this.getOrCreatePlatformWallet("REVENUE", manager)

    // Get customer wallet (for tracking purposes)
    const customerWallet = await this.getOrCreateUserWallet(order.user.id, WalletType.MONEY, manager)

    // Create purchase transaction with journal entries
    const transactionDto = {
      userId: order.user.id,
      walletId: customerWallet.id,
      type: "purchase",
      valueType: "money",
      amount: order.totalAmount,
      currency: "BDT",
      direction: TransactionDirection.OUTFLOW,
      relatedService: "order",
      relatedEntityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          productId: item.product.id,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      },
      journalEntries: [
        {
          // Debit platform revenue account (money coming in)
          accountId: platformWallet.id,
          debit: order.totalAmount,
          credit: 0,
          currency: "BDT",
        },
        {
          // Credit customer account (money going out)
          accountId: customerWallet.id,
          debit: 0,
          credit: order.totalAmount,
          currency: "BDT",
        },
      ],
    }

    return await this.transactionService.createTransactionWithJournal(transactionDto)
  }

  // Distribute revenue shares for the order
  private async distributeOrderRevenue(order: Order, transactionId: string, manager: any) {
    const allRevenueShares: RevenueShare[] = []

    // Process each order item for revenue distribution
    for (const item of order.items) {
      const itemRevenue = item.totalPrice

      // Create revenue shares for this item
      const itemShares = await this.transactionService.distributeGenerationRevenue(
        order.user.id,
        transactionId,
        [10, 8, 7, 6, 5, 4, 3, 2, 1, 1], // Generation percentages
      )

      // Update revenue shares to link to order item
      for (const share of itemShares) {
        share.orderItem = item
        await manager.save(RevenueShare, share)
      }

      allRevenueShares.push(...itemShares)
    }

    return allRevenueShares
  }

  // Process immediate commission payouts (for active users)
  private async processImmediateCommissions(revenueShares: RevenueShare[], manager: any) {
    const platformWallet = await this.getOrCreatePlatformWallet("COMMISSION", manager)
    //TODO: Improve type or fix type
    const paidCommissions: any[] = []

    for (const share of revenueShares) {
      // Check if recipient is active and eligible for immediate payout
      const recipient = await manager.findOne(User, {
        where: { id: share.recipientUser.id },
        relations: ["wallets"],
      })

      if (recipient && recipient.isActive && share.generationLevel <= 3) {
        // Pay first 3 generations immediately
        try {
          const paidTransaction = await this.transactionService.payRevenueShare(share.id, platformWallet.id)
          paidCommissions.push({
            revenueShareId: share.id,
            transactionId: paidTransaction.id,
            amount: share.amount,
            generation: share.generationLevel,
          })
        } catch (error) {
          console.error(`Failed to pay revenue share ${share.id}:`, error)
        }
      }
    }

    return paidCommissions
  }

  // Get or create platform wallet for different purposes
  private async getOrCreatePlatformWallet(type: "REVENUE" | "COMMISSION" | "FEES", manager: any) {
    const platformUser = await this.getOrCreatePlatformUser(manager)

    let wallet = await manager.findOne(Wallet, {
      where: {
        user: { id: platformUser.id },
        walletType: type === "REVENUE" ? WalletType.MONEY : WalletType.COMMISSION,
      },
    })

    if (!wallet) {
      wallet = manager.create(Wallet, {
        user: platformUser,
        walletType: type === "REVENUE" ? WalletType.MONEY : WalletType.COMMISSION,
        balance: 0,
        currency: "BDT",
        isActive: true,
      })
      await manager.save(wallet)
    }

    return wallet
  }

  // Get or create platform system user
  private async getOrCreatePlatformUser(manager: any) {
    let platformUser = await manager.findOne(User, {
      where: { email: "platform@system.internal" },
    })

    if (!platformUser) {
      platformUser = manager.create(User, {
        username: "platform_system",
        email: "platform@system.internal",
        name: "Platform System",
        isActive: true,
        role: "SYSTEM",
      })
      await manager.save(platformUser)
    }

    return platformUser
  }

  // Get or create user wallet
  private async getOrCreateUserWallet(userId: string, walletType: WalletType, manager: any) {
    let wallet = await manager.findOne(Wallet, {
      where: {
        user: { id: userId },
        walletType: walletType,
      },
    })

    if (!wallet) {
      const user = await manager.findOne(User, { where: { id: userId } })
      if (!user) throw new NotFoundException("User not found")

      wallet = manager.create(Wallet, {
        user: user,
        walletType: walletType,
        balance: 0,
        currency: "BDT",
        isActive: true,
      })
      await manager.save(wallet)
    }

    return wallet
  }

  // Batch process pending commissions (for scheduled jobs)
  async processPendingCommissions(limit = 100) {
    const pendingShares = await this.revenueRepo.find({
      where: { status: "pending" },
      relations: ["recipientUser", "transaction"],
      take: limit,
      order: { createdAt: "ASC" },
    })

    const platformWallet = await this.getOrCreatePlatformWallet("COMMISSION", this.dataSource.manager)
    //TODO: FIX type
    const results: any[] = []

    for (const share of pendingShares) {
      try {
        const paidTransaction = await this.transactionService.payRevenueShare(share.id, platformWallet.id)
        results.push({
          success: true,
          revenueShareId: share.id,
          transactionId: paidTransaction.id,
          amount: share.amount,
        })
      } catch (error) {
        results.push({
          success: false,
          revenueShareId: share.id,
          error: error.message,
        })
      }
    }

    return {
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    }
  }

  // Get financial summary for admin dashboard
  async getFinancialSummary(startDate?: Date, endDate?: Date) {
    const dateFilter = {}
    if (startDate) dateFilter["createdAt"] = { $gte: startDate }
    if (endDate) dateFilter["createdAt"] = { ...dateFilter["createdAt"], $lte: endDate }

    const [totalRevenue, totalCommissions, pendingCommissions, platformBalance] = await Promise.all([
      this.getTotalRevenue(dateFilter),
      this.getTotalCommissions(dateFilter),
      this.getPendingCommissions(),
      this.getPlatformBalance(),
    ])

    return {
      totalRevenue,
      totalCommissions,
      pendingCommissions,
      platformBalance,
      netRevenue: totalRevenue - totalCommissions,
    }
  }

  private async getTotalRevenue(dateFilter: any) {
    // Implementation for total revenue calculation
    return 0 // Placeholder
  }

  private async getTotalCommissions(dateFilter: any) {
    // Implementation for total commissions calculation
    return 0 // Placeholder
  }

  private async getPendingCommissions() {
    const result = await this.revenueRepo
      .createQueryBuilder("revenue")
      .where("revenue.status = :status", { status: "pending" })
      .select("SUM(revenue.amount)", "total")
      .getRawOne()

    return Number.parseFloat(result.total) || 0
  }

  private async getPlatformBalance() {
    // Implementation for platform balance calculation
    return 0 // Placeholder
  }

  async retryOrderFulfillment(orderId: string) {
    const order = await this.dataSource.manager.findOne(Order, {
      where: { id: orderId },
      relations: ["items", "items.product", "user"],
    })

    if (!order) {
      throw new NotFoundException("Order not found")
    }

    try {
      const fulfillmentResult = await this.fulfillmentOrchestrator.processOrderFulfillment(order)

      if (fulfillmentResult.success) {
        await this.ordersService.updateStatus(orderId, OrderStatus.COMPLETED)
      }

      return fulfillmentResult
    } catch (error) {
      console.error(`[v0] Fulfillment retry failed for order ${orderId}:`, error)
      throw error
    }
  }

  async getOrderProcessingStatus(orderId: string) {
    const order = await this.dataSource.manager.findOne(Order, {
      where: { id: orderId },
      relations: ["items", "items.product", "user"],
    })

    if (!order) {
      throw new NotFoundException("Order not found")
    }

    // Get financial processing status
    const revenueShares = await this.revenueRepo.find({
      where: { orderItem: { order: { id: orderId } } },
      relations: ["recipientUser"],
    })

    // Get fulfillment status
    const fulfillmentStatus = await this.fulfillmentOrchestrator.getFulfillmentStatus(orderId)

    return {
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
      },
      financial: {
        totalCommissions: revenueShares.reduce((sum, share) => sum + share.amount, 0),
        paidCommissions: revenueShares.filter((share) => share.status === "paid").length,
        pendingCommissions: revenueShares.filter((share) => share.status === "pending").length,
      },
      fulfillment: fulfillmentStatus,
    }
  }
}
