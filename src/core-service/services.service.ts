import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class ServicesCrudService<T extends object> {
  constructor(private readonly repo: Repository<T>) {}

  create(data: any): Promise<T> {
    const entity = this.repo.create(data);
    // Ensure entity is not an array before saving
    if (Array.isArray(entity)) {
      throw new Error('Batch creation is not supported in this method.');
    }

    return this.repo.save(entity) as Promise<T>;
  }

  findAll(): Promise<T[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<T> {
    const item = await this.repo.findOne({ where: { id } as any });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: string, data: any): Promise<T> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
