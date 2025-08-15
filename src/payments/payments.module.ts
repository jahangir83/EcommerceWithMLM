import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PaymentsController } from "./payments.controller"
import { PaymentsService } from "./payments.service"
import { OrdersModule } from "~/orders/orders.module"
import { Payment } from "./entities/payment.entity"
import { Order } from "~/orders/entities/order.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order]), OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
