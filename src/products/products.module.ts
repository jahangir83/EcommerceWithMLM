import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductsController } from "./products.controller"
import { ProductsService } from "./products.service"
import { CategoriesController } from "./categories.controller"
import { CategoriesService } from "./categories.service"
import { Product, Category } from "~/entity"

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  controllers: [ProductsController, CategoriesController],
  providers: [ProductsService,CategoriesService ],
  exports: [ProductsService, ],
})
export class ProductsModule {}
