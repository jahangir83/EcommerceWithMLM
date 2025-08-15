import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ReportsController } from "./reports.controller"
import { ReportsService } from "./reports.service"
import { User, Transaction, RevenueShare, Product } from "~/entity"
import { Order } from "~/orders/entities/order.entity"

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Transaction, RevenueShare, Product])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
