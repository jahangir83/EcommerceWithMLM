import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PaymentsController } from "./payments.controller"
import { PaymentsService } from "./payments.service"
import { Payment, Order } from "~/entity"
import { OrdersModule } from "~/orders/orders.module"

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order]), OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
