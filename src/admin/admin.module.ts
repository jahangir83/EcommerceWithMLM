import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AdminController } from "./admin.controller"
import { AdminService } from "./admin.service"
import { User, Product, Transaction, RevenueShare } from "~/entity"
import { Order } from "~/orders/entities/order.entity"

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Order, Transaction, RevenueShare])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
