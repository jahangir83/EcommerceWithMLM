import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { OrdersController } from "./orders.controller"
import { OrdersService } from "./orders.service"
import { Order, OrderItem, Product, User } from "~/entity"
import { ProductsModule } from "~/products/products.module"

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, User]), ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
