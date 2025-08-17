import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductsController } from "./products.controller"
import { ProductsService } from "./products.service"
import { CategoryController } from "./categories.controller"
import { CategoryService } from "./categories.service"
import { Product, Category } from "~/entity"

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  controllers: [ProductsController, CategoryController],
  providers: [ProductsService, CategoryService],
  exports: [ProductsService,],
})
export class ProductsModule { }
