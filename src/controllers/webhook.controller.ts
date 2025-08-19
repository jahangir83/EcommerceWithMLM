import { Controller, Post, Headers, HttpCode } from "@nestjs/common"
import type { WebhookService } from "~/services/webhook.service"

@Controller("webhooks")
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post("stripe")
  @HttpCode(200)
  async handleStripeWebhook(payload: any, @Headers("stripe-signature") signature: string) {
    return this.webhookService.handleStripeWebhook(payload, signature)
  }

  @Post("bkash")
  @HttpCode(200)
  async handleBkashWebhook(payload: any) {
    return this.webhookService.handleBkashWebhook(payload)
  }

  @Post("nagad")
  @HttpCode(200)
  async handleNagadWebhook(payload: any) {
    // Similar implementation for Nagad
    return { received: true }
  }
}
