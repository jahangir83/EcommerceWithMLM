import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AdminController } from "./admin.controller"
import { AdminService } from "./admin.service"
import { User, Product, Transaction, RevenueShare } from "~/entity"
import { Order } from "~/orders/entities/order.entity"
import { TransactionsModule } from "~/transactions/transactions.module"
import { FinancialOrchestratorService } from "~/transactions/services/financial-orchestrator.service"
import { OrdersModule } from "~/orders/orders.module"
import { ServicesModule } from "~/services/services.module"

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Order, Transaction, RevenueShare]), TransactionsModule, OrdersModule, ServicesModule],
  controllers: [AdminController],
  providers: [AdminService, FinancialOrchestratorService],
  exports: [AdminService],
})
export class AdminModule {}