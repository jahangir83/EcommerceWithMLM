import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import {
  CreateCourseDto,
  UpdateCourseDto,
} from './dto/create-service.dto';
import { ServicesCrudService } from './services.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '~/entity';
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard';
import { RolesGuard } from '~/common/guards/roles.guard';
import { UserStatus } from '~/common/enums/common.enum';
import { Roles } from '~/common/decorators/roles.decorator';
import { UserRole } from '~/common/enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CourseController {
  private service: ServicesCrudService<Course>;

  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {
    this.service = new ServicesCrudService<Course>(this.repo);
  }

  @Post('create')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new course (Admin only)' })
  @ApiResponse({ status: 201, description: 'Course created successfully.' })
  @ApiResponse({ status: 409, description: 'Course already exists.' })
  async create(@Body() dto: CreateCourseDto) {
    const existingCourse = await this.repo.findOne({
      where: { serviceStatus: UserStatus.ADVANCED_ASSOCIATE },
    });

    if (existingCourse) {
      throw new ConflictException('Course service already exists.');
    }

    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'List of all courses.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ status: 200, description: 'Course details.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update course by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a course by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
