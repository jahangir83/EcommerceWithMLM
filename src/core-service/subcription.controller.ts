import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/create-service.dto';
import { ServicesCrudService } from './services.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '~/entity';
import { UserStatus } from '~/common/enums/common.enum';
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard';
import { RolesGuard } from '~/common/guards/roles.guard';
import { Roles } from '~/common/decorators/roles.decorator';
import { UserRole } from '~/common/enums/role.enum';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
  private service: ServicesCrudService<Subscription>;

  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
  ) {
    this.service = new ServicesCrudService<Subscription>(this.repo);
  }

  @Post()
  @ApiOperation({ summary: 'Create a subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 409, description: 'Subscription already exists' })
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateSubscriptionDto) {
    const subscription = await this.repo.findOne({
      where: { serviceStatus: UserStatus.ADVANCED_ACCESS_USER },
    });

    if (subscription) {
      throw new ConflictException(`Subscription with status ${dto.serviceStatus} already exists`);
    }
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({ status: 200, description: 'List of subscriptions' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the subscription' })
  @ApiResponse({ status: 200, description: 'Subscription found' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiParam({ name: 'id', description: 'UUID of the subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })

  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiParam({ name: 'id', description: 'UUID of the subscription' })
  @ApiResponse({ status: 200, description: 'Subscription removed successfully' })

  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
