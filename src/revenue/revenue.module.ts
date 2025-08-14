import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueShare } from './entities/revenue-share.entity';
import { RevenueService } from './revenue.service';

@Module({
  imports: [TypeOrmModule.forFeature([RevenueShare])],
  providers: [RevenueService],
  exports: [RevenueService],
})
export class RevenueModule {}
