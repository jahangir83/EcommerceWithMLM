import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { VendorController } from "./vendor.controller"
import { VendorService } from "./vendor.service"
import { User, Product, Order } from "~/entity"

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Order])],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService],
})
export class VendorModule {}
