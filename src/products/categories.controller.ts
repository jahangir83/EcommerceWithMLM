import { Controller, Get, Post, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { CategoriesService } from "./categories.service"
import type { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto"
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard"
import { RolesGuard } from "~/common/guards/roles.guard"
import { Roles } from "~/common/decorators/roles.decorator"
import { UserRole } from "~/common/enums/role.enum"

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto)
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll()
  }

  @Get("tree")
  findTree() {
    return this.categoriesService.findTree()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
