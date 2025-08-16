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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-service.dto';
import { ServicesCrudService } from './services.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Uddokta } from '~/entity';
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard';
import { RolesGuard } from '~/common/guards/roles.guard';
import { Roles } from '~/common/decorators/roles.decorator';
import { UserRole } from '~/common/enums/role.enum';
import { UserStatus } from '~/common/enums/common.enum';

@ApiTags('uddokta')
@ApiBearerAuth() // shows lock icon in Swagger UI (JWT protected)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('uddokta')
export class UddoktaController {
  private service: ServicesCrudService<Uddokta>;

  constructor(
    @InjectRepository(Uddokta)
    private readonly repo: Repository<Uddokta>,
  ) {
    this.service = new ServicesCrudService<Uddokta>(this.repo);
  }

  @Post('create')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new Uddokta (Admin only)' })
  @ApiResponse({ status: 201, description: 'Uddokta created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins allowed' })
  async create(@Body() dto: CreateCourseDto) {

    // Check already exist
    const uddokta = await this.repo.findOne({
      where: {
        serviceStatus: UserStatus.ADVANCED_UDDOKTA
      }
    })

    if (uddokta) {
      throw new ConflictException('Uddokta service already exists')
    }
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Uddoktas' })
  @ApiResponse({ status: 200, description: 'List of Uddoktas returned' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Uddokta by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the Uddokta' })
  @ApiResponse({ status: 200, description: 'Uddokta found' })
  @ApiResponse({ status: 404, description: 'Uddokta not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a Uddokta (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the Uddokta' })
  @ApiResponse({ status: 200, description: 'Uddokta updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins allowed' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a Uddokta (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the Uddokta' })
  @ApiResponse({ status: 200, description: 'Uddokta deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins allowed' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
