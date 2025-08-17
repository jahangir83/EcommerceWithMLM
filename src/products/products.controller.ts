import {
  Controller, Get, Post, Param, Delete, Query, UseGuards, Body,
  Put
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto, ProductFilterDto, UpdateProductDto } from "./dto/product.dto";
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard";
import { RolesGuard } from "~/common/guards/roles.guard";
import { Roles } from "~/common/decorators/roles.decorator";
import { UserRole } from "~/common/enums/role.enum";
import {
  ApiTags, ApiOperation, ApiResponse, ApiQuery,
} from "@nestjs/swagger";
import { Product } from "~/entity";



@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // 📌 Create
  @Post()
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: Product })
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.createProduct(dto);
  }

  // 📌 Find All with filters
  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'vendorId', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'Return list of products' })
  async findAll(@Query() query: ProductFilterDto) {
    return this.productsService.findAll(query);
  }

  // 📌 Find One
  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiResponse({ status: 200, description: 'Return product', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  // 📌 Update
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  // 📌 Delete (soft delete)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // 📌 Featured Products
  @Get('featured/list')
  @ApiOperation({ summary: 'Get featured products' })
  async getFeatured() {
    return this.productsService.getFeaturedProducts();
  }

  // 📌 Related Products
  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products by category' })
  @ApiResponse({ status: 200, description: 'Related products returned' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getRelated(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }
}