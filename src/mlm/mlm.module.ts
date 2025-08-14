import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MlmController } from "./mlm.controller"
import { MlmService } from "./mlm.service"
import { User, RevenueShare, Transaction, LeaderShipDisignation } from "~/entity"

@Module({
  imports: [TypeOrmModule.forFeature([User, RevenueShare, Transaction, LeaderShipDisignation])],
  controllers: [MlmController],
  providers: [MlmService],
  exports: [MlmService],
})
export class MlmModule {}
