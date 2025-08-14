import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(@InjectRepository(Achievement) private readonly achievements: Repository<Achievement>) {}

  async grant(userId: string, key: string, title: string, description?: string) {
    const existing = await this.achievements.findOne({ where: { user: { id: userId } as any, key } as any });
    if (existing) return existing;
    const a = this.achievements.create({ user: { id: userId } as any, key, title, description, achieved: true });
    return this.achievements.save(a);
  }
}
