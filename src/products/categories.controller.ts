import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body, Put } from "@nestjs/common"
import { CategoryService } from "./categories.service"
import type { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto"
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard"
import { RolesGuard } from "~/common/guards/roles.guard"
import { Roles } from "~/common/decorators/roles.decorator"
import { UserRole } from "~/common/enums/role.enum"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Category } from "~/entity"


@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOkResponse({ type: Category, description: "Create new category" })
  create(@Body() body: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(body)
  }

  @Get()
  @ApiOkResponse({ type: [Category], description: "Get all categories" })
  findAll(): Promise<Category[]> {
    return this.categoryService.getAllCategories()
  }

  @Get(":id")
  @ApiOkResponse({
    type: Category,
    description: "Get category with recursive children and products",
  })
  findOne(@Param("id") id: string): Promise<Category> {
    return this.categoryService.getCategoryTreeWithProducts(id)
  }

  @Put(":id")
  @ApiOkResponse({ type: Category, description: "Update category" })
  update(@Param("id") id: string, @Body() body: Partial<Category>) {
    return this.categoryService.updateCategory(id, body)
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Delete category" })
  remove(@Param("id") id: string): Promise<void> {
    return this.categoryService.deleteCategory(id)
  }
}

// @Controller("categories")
// export class CategoriesController {
//   constructor(private readonly categoriesService: CategoriesService) {}

//   @Post()
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   create(createCategoryDto: CreateCategoryDto) {
//     return this.categoriesService.create(createCategoryDto)
//   }

//   @Get()
//   findAll() {
//     return this.categoriesService.findAll()
//   }

//   @Get("tree")
//   findTree() {
//     return this.categoriesService.findTree()
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.categoriesService.findOne(id);
//   }

//   @Patch(":id")
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   update(@Param('id') id: string, updateCategoryDto: UpdateCategoryDto) {
//     return this.categoriesService.update(id, updateCategoryDto)
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN)
//   remove(@Param('id') id: string) {
//     return this.categoriesService.remove(id);
//   }
// }
