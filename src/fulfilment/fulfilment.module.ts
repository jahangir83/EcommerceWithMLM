import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';
import { FulfilmentService } from './fulfilment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment])],
  providers: [FulfilmentService],
  exports: [FulfilmentService],
})
export class FulfilmentModule {}
