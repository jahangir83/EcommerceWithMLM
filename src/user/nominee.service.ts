// nominee.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateNomineeDto, UpdateNomineeDto } from './dto/create-nominee.dto';
import { Nominee } from '~/entity/users/nominee.entity';
import { User } from '~/entity';

@Injectable()
export class NomineeService {
  constructor(
    @InjectRepository(Nominee)
    private nomineeRepo: Repository<Nominee>,

    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async create(dto: CreateNomineeDto): Promise<Nominee> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const nominee = this.nomineeRepo.create({
      ...dto,
      user,
    });

    return this.nomineeRepo.save(nominee);
  }

  async findAll(): Promise<Nominee[]> {
    return this.nomineeRepo.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Nominee> {
    const nominee = await this.nomineeRepo.findOne({ where: { id }, relations: ['user'] });
    if (!nominee) {
      throw new NotFoundException('Nominee not found');
    }
    return nominee;
  }

  async findByUserId(userId: string): Promise<Nominee | null> {
    if(!userId) return null;
    return this.nomineeRepo.findOne({ where: { user: { id: userId } } });
  }

  async update(id: string, dto: UpdateNomineeDto): Promise<Nominee> {
    const nominee = await this.findOne(id);

    if (dto.userId) {
      const user = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('User not found');
      nominee.user = user;
    }

    Object.assign(nominee, dto);
    return this.nomineeRepo.save(nominee);
  }

  async remove(id: string): Promise<void> {
    const nominee = await this.findOne(id);
    await this.nomineeRepo.remove(nominee);
  }
}
