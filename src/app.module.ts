import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"
import { ThrottlerModule } from "@nestjs/throttler"
import { UserModule } from "./user/user.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
  User,
  UserProfile,
  AccountBalance,
  Wallet,

  Withdrawal,
  Transaction,
  Course,
  Subscription,
  Uddokta,
  RevenueShare,
  JournalEntry,
  LeaderShipDisignation,
  Product,
  Category,
} from "./entity/index"

import { AppController } from "./app.controller"
import { Order } from "./orders/entities/order.entity"
import { Payment } from "./payments/entities/payment.entity"
import { OrderItem } from "./orders/entities/order-item.entity"
import { ProductsModule } from "./products/products.module"
import { OrdersModule } from "./orders/orders.module"
import { PaymentsModule } from "./payments/payments.module"
import { TransactionsModule } from "./transactions/transactions.module"
import { MlmModule } from "./mlm/mlm.module"
import { VendorModule } from "./vendor/vendor.module"
import { AdminModule } from "./admin/admin.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { ReportsModule } from "./reports/reports.module"
import { CoreServiceModule } from "./core-service/core-service.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number.parseInt(process.env.THROTTLE_TTL ?? "60") || 60,
        limit: Number.parseInt(process.env.THROTTLE_LIMIT ?? "10") || 10,
      },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("DATABASE_URL"),
        synchronize: true,
        // logging: configService.get<string>("NODE_ENV") === "development",
        entities: [
          User,
          UserProfile,
          AccountBalance,
          Wallet,
          Order,
          Payment,
          Withdrawal,
          Transaction,
          Course,
          Subscription,
          Uddokta,
          RevenueShare,
          JournalEntry,
          LeaderShipDisignation,
          Product,
          Category,
          OrderItem,
        ],
      }),
    }),

    AuthModule,
    UserModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    TransactionsModule,
    ProductsModule,
    CoreServiceModule,
    MlmModule,
    VendorModule,
    AdminModule,
    NotificationsModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
