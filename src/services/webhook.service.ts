import { Injectable } from "@nestjs/common"
import  { PaymentsService } from "~/payments/payments.service"
import { PaymentStatus } from "~/payments/entities/payment.entity"

@Injectable()
export class WebhookService {
  constructor(private paymentsService: PaymentsService) {}

  async handleStripeWebhook(payload: any, signature: string) {
    // Verify webhook signature in production
    const event = payload

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSuccess(event.data.object)
        break
      case "payment_intent.payment_failed":
        await this.handlePaymentFailure(event.data.object)
        break
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return { received: true }
  }

  async handleBkashWebhook(payload: any) {
    const { paymentID, trxID, transactionStatus } = payload

    if (transactionStatus === "Completed") {
      await this.handlePaymentSuccess({ id: paymentID, gateway_reference: trxID })
    } else if (transactionStatus === "Failed") {
      await this.handlePaymentFailure({ id: paymentID, gateway_reference: trxID })
    }

    return { received: true }
  }

  private async handlePaymentSuccess(paymentData: any) {
    try {
      await this.paymentsService.updateStatus(
        paymentData.id,
        PaymentStatus.SUCCESS,
        paymentData.gateway_reference,
        paymentData,
      )
    } catch (error) {
      console.error("Failed to process payment success webhook:", error)
    }
  }

  private async handlePaymentFailure(paymentData: any) {
    try {
      await this.paymentsService.updateStatus(
        paymentData.id,
        PaymentStatus.FAILED,
        paymentData.gateway_reference,
        paymentData,
      )
    } catch (error) {
      console.error("Failed to process payment failure webhook:", error)
    }
  }
}
