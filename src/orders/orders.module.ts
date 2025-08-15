import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { OrdersController } from "./orders.controller"
import { OrdersService } from "./orders.service"
import {Product, User } from "~/entity"
import { ProductsModule } from "~/products/products.module"
import { OrderItem } from "./entities/order-item.entity"
import { Order } from "./entities/order.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, User]), ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
