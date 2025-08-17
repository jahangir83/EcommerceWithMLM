import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, Not } from "typeorm"
import { Category, Product, ProductStatus } from "~/entity"
import type { CreateProductDto, UpdateProductDto, ProductFilterDto } from "./dto/product.dto"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // async create(createProductDto: CreateProductDto): Promise<Product> {
  //   const product = this.productRepo.create(createProductDto)
  //   return this.productRepo.save(product)
  // }

    // Create product
  async createProduct(data: CreateProductDto): Promise<Product> {
    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } })
      if (!category) throw new NotFoundException("Category not found")
      data.category = category
    }
    const product = this.productRepo.create(data)
    return this.productRepo.save(product)
  }

  // TODO: We should avoid any 
  async findAll(filterDto:any /*ProductFilterDto = {}*/) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      minPrice,
      maxPrice,
      type,
      status = ProductStatus.ACTIVE,
      isFeatured,
      vendorId,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = filterDto

    const queryBuilder = this.productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.vendor", "vendor")
      .where("product.isActive = :isActive", { isActive: true })

    if (search) {
      queryBuilder.andWhere("(product.name ILIKE :search OR product.description ILIKE :search)", {
        search: `%${search}%`,
      })
    }

    if (categoryId) {
      queryBuilder.andWhere("product.categoryId = :categoryId", { categoryId })
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice })
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice })
    }

    if (type) {
      queryBuilder.andWhere("product.type = :type", { type })
    }

    if (status) {
      queryBuilder.andWhere("product.status = :status", { status })
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere("product.isFeatured = :isFeatured", { isFeatured })
    }

    if (vendorId) {
      queryBuilder.andWhere("product.vendorId = :vendorId", { vendorId })
    }

    queryBuilder
      .orderBy(`product.${sortBy}`, sortOrder as "ASC" | "DESC")
      .skip((page - 1) * limit)
      .take(limit)

    const [items, total] = await queryBuilder.getManyAndCount()

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ["category", "vendor"],
    })

    if (!product) {
      throw new NotFoundException("Product not found")
    }

    // Increment view count
    await this.productRepo.increment({ id }, "viewCount", 1)

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({where:{id}})
    if(!product){
      throw new NotFoundException("Product not found!");
    }

    Object.assign(product, updateProductDto)
    return this.productRepo.save(product)
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepo.findOne({where:{id}});

    if(!product){
      throw new NotFoundException("Product not found!");
    }
    
    product.isActive = false
    await this.productRepo.save(product)
  }

  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    return this.productRepo.find({
      where: { isFeatured: true, isActive: true, status: ProductStatus.ACTIVE },
      relations: ["category", "vendor"],
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async getRelatedProducts(productId: string, limit = 5): Promise<Product[]> {
    const product = await this.productRepo.findOne({
      where:{
        id: productId
      }
    })

    if(!product){
      throw new NotFoundException("This product not found!")
    }

    return this.productRepo.find({
      where: {
        category: { id: product.category.id },
        isActive: true,
        status: ProductStatus.ACTIVE,
        id: Not(productId),
      },
      relations: ["category", "vendor"],
      order: { salesCount: "DESC" },
      take: limit,
    })
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    await this.productRepo.decrement({ id: productId }, "stock", quantity)
    await this.productRepo.increment({ id: productId }, "salesCount", quantity)
  }
}
