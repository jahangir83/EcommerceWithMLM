import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateCourseDto, CreateSubscriptionDto, UpdateCourseDto, UpdateSubscriptionDto } from './dto/create-service.dto';
import { ServicesCrudService } from './services.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Uddokta  } from '~/entity';

@Controller('uddokta')
export class UddoktaController {
  private service: ServicesCrudService<Uddokta>;

  constructor(
    @InjectRepository(Uddokta)
    private readonly repo: Repository<Uddokta>,
  ) {
    this.service = new ServicesCrudService<Uddokta>(this.repo);
  }

  @Post()
  create(@Body() dto: CreateCourseDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
