import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenueShare } from './entities/revenue-share.entity';

@Injectable()
export class RevenueService {
  constructor(@InjectRepository(RevenueShare) private readonly shares: Repository<RevenueShare>) {}

  // Distribute across N levels; caller passes computed recipients
  async distribute(orderItemId: string, distributions: Array<{ userId: string; amount: number; level: number }>) {
    const rows = distributions.map(d => this.shares.create({
      receiver: { id: d.userId } as any,
      orderItem: { id: orderItemId } as any,
      level: d.level,
      amount: d.amount,
    }));
    return this.shares.save(rows);
  }
}
