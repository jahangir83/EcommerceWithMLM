// nominee.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NomineeService } from './nominee.service';
import { CreateNomineeDto, UpdateNomineeDto } from './dto/create-nominee.dto';
import { Nominee } from '~/entity/users/nominee.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard';
import { RolesGuard } from '~/common/guards/roles.guard';
import { AuthenticateRequest } from '~/common/types/user.type';


@ApiTags('Nominee')
@Controller('nominees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NomineeController {
    constructor(private readonly nomineeService: NomineeService) { }

    @Post()
    @ApiOperation({ summary: 'Create a nominee' })
    @ApiResponse({ status: 201, description: 'Nominee created', type: Nominee })
    @ApiBody({ type: CreateNomineeDto })
    create(@Body() dto: CreateNomineeDto, @Req() req:AuthenticateRequest): Promise<Nominee> {
        Object.assign(dto, {userId: req.user.id})
        return this.nomineeService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all nominees' })
    @ApiResponse({ status: 200, description: 'List of nominees', type: [Nominee] })
    findAll(): Promise<Nominee[]> {
        return this.nomineeService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a nominee by ID' })
    @ApiResponse({ status: 200, description: 'Nominee details', type: Nominee })
    findOne(@Param('id') id: string): Promise<Nominee> {
        return this.nomineeService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a nominee' })
    @ApiResponse({ status: 200, description: 'Nominee updated', type: Nominee })
    @ApiBody({ type: UpdateNomineeDto })
    update(@Param('id') id: string, @Body() dto: UpdateNomineeDto): Promise<Nominee> {
        return this.nomineeService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a nominee' })
    @ApiResponse({ status: 200, description: 'Nominee deleted' })
    remove(@Param('id') id: string): Promise<void> {
        return this.nomineeService.remove(id);
    }
}
