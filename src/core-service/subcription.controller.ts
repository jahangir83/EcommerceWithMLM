import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/create-service.dto';
import { ServicesCrudService } from './services.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '~/entity';

@Controller('subscriptions')
export class SubscriptionController {
  private service: ServicesCrudService<Subscription>;

  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
  ) {
    this.service = new ServicesCrudService<Subscription>(this.repo);
  }

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
