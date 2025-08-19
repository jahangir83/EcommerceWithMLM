import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EmailService } from "./email.service"
import { WebhookService } from "./webhook.service"
import { InventoryService } from "./inventory.service"
import { SubscriptionBillingService } from "./subscription-billing.service"
import { CronService } from "./cron.service"
import { DigitalDeliveryService } from "./digital-delivery.service"
import { FulfillmentOrchestratorService } from "./fulfillment-orchestrator.service"
import { User, Product, Course, Subscription, RevenueShare, Category, Transaction, JournalEntry, Wallet, AccountBalance } from "~/entity"
import { FulfilmentModule } from "~/fulfilment/fulfilment.module"
import { NotificationsModule } from "~/notifications/notifications.module"
import { PaymentsModule } from "~/payments/payments.module"
import { TransactionsModule } from "~/transactions/transactions.module"
import { PaymentsService } from "~/payments/payments.service"
import { OrdersService } from "~/orders/orders.service"
import { FinancialOrchestratorService } from "~/transactions/services/financial-orchestrator.service"
import { Payment } from "~/payments/entities/payment.entity"
import { Order } from "~/orders/entities/order.entity"
import { OrderItem } from "~/orders/entities/order-item.entity"
import { ProductsService } from "~/products/products.service"
import { TransactionService } from "~/transactions/services/transaction.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Course, Subscription, Payment, Order, OrderItem, RevenueShare, Category, Transaction, JournalEntry, Wallet, AccountBalance]),
    FulfilmentModule,
    NotificationsModule,
    PaymentsModule,
 
  ],
  providers: [
    EmailService,
    WebhookService,
    InventoryService,
    SubscriptionBillingService,
    CronService,
    DigitalDeliveryService,
    FulfillmentOrchestratorService,
    PaymentsService,
    OrdersService,
    FinancialOrchestratorService,
    ProductsService,
    TransactionService
  ],
  exports: [
    EmailService,
    WebhookService,
    InventoryService,
    SubscriptionBillingService,
    CronService,
    DigitalDeliveryService,
    FulfillmentOrchestratorService,
  ],
})
export class ServicesModule {}
