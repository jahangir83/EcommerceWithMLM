import { Controller, Get, Post, Patch, Param, Delete, Query, UseGuards } from "@nestjs/common"
import type { ProductsService } from "./products.service"
import type { CreateProductDto } from "./dto/product.dto"
import type { UpdateProductDto } from "./dto/product.dto"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { RolesGuard } from "../common/guards/roles.guard"
import { Roles } from "../common/decorators/roles.decorator"
import { Role } from "../common/enums/role.enum"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger"

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({
    status: 201,
    description: "Product created successfully",
    schema: {
      example: {
        id: 1,
        name: "Sample Product",
        description: "Product description",
        price: 99.99,
        stock: 100,
        category: "Electronics",
        vendor: {
          id: 1,
          name: "Vendor Name",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
  create(createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all products with pagination and filters" })
  @ApiQuery({ name: "page", required: false, description: "Page number", example: 1 })
  @ApiQuery({ name: "limit", required: false, description: "Items per page", example: 10 })
  @ApiQuery({ name: "category", required: false, description: "Filter by category" })
  @ApiQuery({ name: "search", required: false, description: "Search in product name and description" })
  @ApiQuery({ name: "minPrice", required: false, description: "Minimum price filter" })
  @ApiQuery({ name: "maxPrice", required: false, description: "Maximum price filter" })
  @ApiResponse({
    status: 200,
    description: "Products retrieved successfully",
    schema: {
      example: {
        data: [
          {
            id: 1,
            name: "Sample Product",
            description: "Product description",
            price: 99.99,
            stock: 100,
            images: ["image1.jpg", "image2.jpg"],
            category: {
              id: 1,
              name: "Electronics",
            },
            vendor: {
              id: 1,
              name: "Vendor Name",
            },
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    },
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.productsService.findAll({
      page: page || 1,
      limit: limit || 10,
      category,
      search,
      minPrice,
      maxPrice,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product found',
    schema: {
      example: {
        id: 1,
        name: 'Sample Product',
        description: 'Detailed product description',
        price: 99.99,
        stock: 100,
        images: ['image1.jpg', 'image2.jpg'],
        specifications: {
          weight: '1kg',
          dimensions: '10x10x10cm'
        },
        category: {
          id: 1,
          name: 'Electronics'
        },
        vendor: {
          id: 1,
          name: 'Vendor Name',
          rating: 4.5
        },
        reviews: [
          {
            id: 1,
            rating: 5,
            comment: 'Great product!',
            user: 'John Doe'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product not found" })
  update(@Param('id') id: string, updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
