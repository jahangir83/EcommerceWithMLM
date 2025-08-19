import { Injectable, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import {  Repository, LessThan, LessThanOrEqual } from "typeorm"
import  { Product } from "~/entity/products/product.entity"

@Injectable()
export class InventoryService {
  constructor(@InjectRepository(Product) private productRepo: Repository<Product>) {}

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.productRepo.findOne({ where: { id: productId } })

    if (!product) {
      throw new BadRequestException("Product not found")
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`)
    }

    // Reserve stock by reducing available quantity
    product.stock -= quantity
    await this.productRepo.save(product)

    return true
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id: productId } })

    if (product) {
      product.stock += quantity
      await this.productRepo.save(product)
    }
  }

  async updateStock(productId: string, newStock: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id: productId } })

    if (!product) {
      throw new BadRequestException("Product not found")
    }

    product.stock = newStock
    return this.productRepo.save(product)
  }

  async getLowStockProducts(threshold = 10): Promise<Product[]> {
    return this.productRepo.find({
      where: { stock: LessThanOrEqual(threshold) },
      order: { stock: "ASC" },
    })
  }

  async getStockReport() {
    const [totalProducts, outOfStock, lowStock, totalValue] = await Promise.all([
      this.productRepo.count(),
      this.productRepo.count({ where: { stock: 0 } }),
      this.productRepo.count({ where: { stock: LessThan(10) } }),
      this.productRepo
        .createQueryBuilder("product")
        .select("SUM(product.price * product.stock)", "total")
        .getRawOne()
        .then((result) => Number.parseFloat(result.total) || 0),
    ])

    return {
      totalProducts,
      outOfStock,
      lowStock,
      totalValue,
    }
  }
}
