import { Injectable } from "@nestjs/common"
import  { Repository } from "typeorm"
import  { Subscription } from "~/entity/product-services/subscription.entity"
import  { User } from "~/entity/users/user.entity"
import  { PaymentsService } from "~/payments/payments.service"
import  { EmailService } from "./email.service"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class SubscriptionBillingService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private paymentsService: PaymentsService,
    private emailService: EmailService,
  ) {}

  async processRecurringBilling() {
    const dueSubscriptions = await this.subscriptionRepo
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.user", "user")
      .where("subscription.nextBillingDate <= :today", { today: new Date() })
      .andWhere("subscription.status = :status", { status: "active" })
      .getMany()

    const results:any[] = []

    for (const subscription of dueSubscriptions) {
      try {
        const result = await this.processSingleSubscription(subscription)
        results.push({ success: true, subscriptionId: subscription.id, ...result })
      } catch (error) {
        results.push({
          success: false,
          subscriptionId: subscription.id,
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

  private async processSingleSubscription(subscription: Subscription) {
    // Create payment for subscription renewal
    const payment = await this.paymentsService.create({
      orderId: "df",//null, // Subscription payments don't have orders
      amount: subscription.price as any,
      currency: "BDT",
      method:"auto",// subscription.paymentMethod || "auto",
      metadata: {
        subscriptionId: subscription.id,
        billingCycle: "",//subscription.billingCycle,
        isRecurring: true,
      },
    })

    // Process the payment
    const processedPayment = await this.paymentsService.processPayment(payment.id)

    if (processedPayment.status === "success") {
      // Update subscription billing date
      // const nextBillingDate = this.calculateNextBillingDate(subscription.nextBillingDate, subscription.billingCycle)

      // subscription.nextBillingDate = nextBillingDate
      // subscription.lastBillingDate = new Date()
      // await this.subscriptionRepo.save(subscription)

      // // Send confirmation email
      // await this.emailService.sendPaymentConfirmation(
      //   subscription.user.id,
      //   `SUB-${subscription.id}`,
      //   subscription.price,
      // )
    }

    return { paymentId: payment.id, status: processedPayment.status }
  }

  private calculateNextBillingDate(currentDate: Date, billingCycle: string): Date {
    const nextDate = new Date(currentDate)

    switch (billingCycle) {
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case "quarterly":
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
      default:
        nextDate.setMonth(nextDate.getMonth() + 1)
    }

    return nextDate
  }

  async cancelSubscription(subscriptionId: string, reason?: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
      relations: ["user"],
    })

    if (!subscription) {
      throw new Error("Subscription not found")
    }

    // subscription.status = "cancelled"
    // subscription.cancelledAt = new Date()
    // subscription.cancellationReason = reason

    return this.subscriptionRepo.save(subscription)
  }
}
