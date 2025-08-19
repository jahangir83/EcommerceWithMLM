import { Injectable } from "@nestjs/common"
import  { NotificationsService } from "~/notifications/notifications.service"

@Injectable()
export class EmailService {
  constructor(private notificationsService: NotificationsService) {}

  async sendOrderConfirmation(userId: string, orderNumber: string, amount: number) {
    // In production, integrate with SendGrid, AWS SES, or similar
    console.log(`[EMAIL] Order confirmation sent to user ${userId} for order ${orderNumber}`)

    // Create notification as backup
    return this.notificationsService.notifyOrderCreated(userId, orderNumber, amount)
  }

  async sendPaymentConfirmation(userId: string, orderNumber: string, amount: number) {
    console.log(`[EMAIL] Payment confirmation sent to user ${userId} for order ${orderNumber}`)
    return this.notificationsService.notifyPaymentSuccess(userId, orderNumber, amount)
  }

  async sendCommissionNotification(userId: string, amount: number, level: number) {
    console.log(`[EMAIL] Commission notification sent to user ${userId} for $${amount} at level ${level}`)
    return this.notificationsService.notifyCommissionEarned(userId, amount, level)
  }

  async sendWithdrawalConfirmation(userId: string, amount: number, method: string) {
    console.log(`[EMAIL] Withdrawal confirmation sent to user ${userId} for $${amount} via ${method}`)
    return this.notificationsService.notifyWithdrawalProcessed(userId, amount, method)
  }
}
