import { Injectable } from "@nestjs/common"
import  { FulfilmentService } from "~/fulfilment/fulfilment.service"
import  { DigitalDeliveryService } from "./digital-delivery.service"
import  { InventoryService } from "./inventory.service"
import  { EmailService } from "./email.service"
import  { Order } from "~/orders/entities/order.entity"
import  { Product } from "~/entity/products/product.entity"

@Injectable()
export class FulfillmentOrchestratorService {
  constructor(
    private fulfillmentService: FulfilmentService,
    private digitalDeliveryService: DigitalDeliveryService,
    private inventoryService: InventoryService,
    private emailService: EmailService,
  ) {}

  async processOrderFulfillment(order: Order) {
    console.log(`Processing fulfillment for order ${order.id}`)

    const fulfillmentResults:any[] = []

    try {
      // Process each order item
      for (const item of order.items) {
        const product = item.product
        const fulfillmentResult = await this.fulfillSingleItem(order, item, product)
        fulfillmentResults.push(fulfillmentResult)
      }

      // Update inventory for all items
      await this.updateInventoryForOrder(order)

      // Send fulfillment confirmation
      await this.sendFulfillmentConfirmation(order, fulfillmentResults)

      return {
        success: true,
        orderId: order.id,
        fulfillmentResults,
        processedAt: new Date(),
      }
    } catch (error) {
      console.error(`[v0] Fulfillment failed for order ${order.id}:`, error)

      return {
        success: false,
        orderId: order.id,
        error: error.message,
        processedAt: new Date(),
      }
    }
  }

  private async fulfillSingleItem(order: Order, item: any, product: Product) {
    const fulfillmentResult = {
      itemId: item.id,
      productId: product.id,
      productName: product.name,
      productType: product.type,
      quantity: item.quantity,
      fulfillmentMethod: this.determineFulfillmentMethod(product),
      success: false,
      details: {},
    }

    try {
      if (this.isDigitalProduct(product)) {
        // Handle digital product delivery
        const deliveryResult = await this.digitalDeliveryService.deliverDigitalProduct(order.user.id, product.id, {
          orderId: order.id,
          item,
        })

        fulfillmentResult.success = deliveryResult.success
        fulfillmentResult.details = deliveryResult
      } else if (this.isPhysicalProduct(product)) {
        // Handle physical product shipping
        const shipmentResult = await this.fulfillmentService.enqueue(order.id, order.shippingAddress?.preferredCourier)

        fulfillmentResult.success = !!shipmentResult
        fulfillmentResult.details = {
          shipmentId: shipmentResult?.id,
          status: shipmentResult?.status,
          courier: shipmentResult?.courier,
        }
      } else {
        // Handle service-based products
        fulfillmentResult.success = true
        fulfillmentResult.details = {
          message: "Service product - manual fulfillment required",
          requiresManualAction: true,
        }
      }

      return fulfillmentResult
    } catch (error) {
      fulfillmentResult.success = false
      fulfillmentResult.details = { error: error.message }
      return fulfillmentResult
    }
  }

  private async updateInventoryForOrder(order: Order) {
    for (const item of order.items) {
      if (this.isPhysicalProduct(item.product)) {
        await this.inventoryService.updateStock(
          item.product.id,
          -item.quantity, // Decrease stock
        )
      }
    }
  }

  private async sendFulfillmentConfirmation(order: Order, fulfillmentResults: any[]) {
    const digitalItems = fulfillmentResults.filter((r) => r.fulfillmentMethod === "digital")
    const physicalItems = fulfillmentResults.filter((r) => r.fulfillmentMethod === "physical")

    // Send appropriate confirmation emails
    // if (digitalItems.length > 0) {
    //   await this.emailService.sendDigitalFulfillmentConfirmation(
    //     order.user.email,
    //     order.user.name,
    //     order.id,
    //     digitalItems,
    //   )
    // }

    // if (physicalItems.length > 0) {
    //   await this.emailService.sendShippingConfirmation(
    //     order.user.email,
    //     order.user.name,
    //     order.id,
    //     physicalItems,
    //     order.shippingAddress,
    //   )
    // }
  }

  private determineFulfillmentMethod(product: Product): string {
    if (this.isDigitalProduct(product)) return "digital"
    if (this.isPhysicalProduct(product)) return "physical"
    return "service"
  }

  private isDigitalProduct(product: Product): boolean {
    const digitalTypes = ["course", "subscription", "digital_download", "software_license", "ebook"]
    return digitalTypes.includes(product.type?.toLowerCase())
  }

  private isPhysicalProduct(product: Product): boolean {
    const physicalTypes = ["physical", "book", "merchandise", "hardware"]
    return physicalTypes.includes(product.type?.toLowerCase()) 
    //|| product.requiresShipping
  }

  async getFulfillmentStatus(orderId: string) {
    // Get fulfillment status for an order
    const fulfillmentStatus = {
      orderId,
      overallStatus: "processing",
      items: [],
      lastUpdated: new Date(),
    }

    // You would implement logic to check status of each item
    // This is a placeholder for the actual implementation

    return fulfillmentStatus
  }

  async retryFailedFulfillment(orderId: string, itemId?: string) {
    // Retry fulfillment for failed items
    console.log(`[v0] Retrying fulfillment for order ${orderId}, item ${itemId || "all"}`)

    // Implementation would retry specific failed fulfillment steps
    return { success: true, message: "Fulfillment retry initiated" }
  }
}
