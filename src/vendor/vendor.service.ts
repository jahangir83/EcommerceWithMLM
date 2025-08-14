import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type User, type Product, type Order, OrderStatus } from "~/entity"
import { UserRole } from "~/common/enums/role.enum"

@Injectable()
export class VendorService {
  private userRepo: Repository<User>
  private productRepo: Repository<Product>
  private orderRepo: Repository<Order>

  constructor(userRepo: Repository<User>, productRepo: Repository<Product>, orderRepo: Repository<Order>) {
    this.userRepo = userRepo
    this.productRepo = productRepo
    this.orderRepo = orderRepo
  }

  async becomeVendor(userId: string, vendorData: any): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException("User not found")
    }

    if (user.role === UserRole.VENDOR) {
      throw new BadRequestException("User is already a vendor")
    }

    user.role = UserRole.VENDOR
    // You might want to add vendor-specific fields to the User entity
    // or create a separate VendorProfile entity

    return this.userRepo.save(user)
  }

  async getVendorDashboard(vendorId: string) {
    const vendor = await this.userRepo.findOne({ where: { id: vendorId } })
    if (!vendor || vendor.role !== UserRole.VENDOR) {
      throw new NotFoundException("Vendor not found")
    }

    const [totalProducts, activeProducts, totalOrders, completedOrders, totalRevenue, pendingOrders] =
      await Promise.all([
        this.productRepo.count({ where: { vendor: { id: vendorId } } }),
        this.productRepo.count({
          where: { vendor: { id: vendorId }, isActive: true },
        }),
        this.orderRepo
          .createQueryBuilder("order")
          .innerJoin("order.items", "item")
          .innerJoin("item.product", "product")
          .where("product.vendorId = :vendorId", { vendorId })
          .getCount(),
        this.orderRepo
          .createQueryBuilder("order")
          .innerJoin("order.items", "item")
          .innerJoin("item.product", "product")
          .where("product.vendorId = :vendorId", { vendorId })
          .andWhere("order.status = :status", { status: OrderStatus.COMPLETED })
          .getCount(),
        this.orderRepo
          .createQueryBuilder("order")
          .innerJoin("order.items", "item")
          .innerJoin("item.product", "product")
          .where("product.vendorId = :vendorId", { vendorId })
          .andWhere("order.status IN (:...statuses)", {
            statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
          })
          .select("SUM(item.totalPrice)", "total")
          .getRawOne()
          .then((result) => Number.parseFloat(result.total) || 0),
        this.orderRepo
          .createQueryBuilder("order")
          .innerJoin("order.items", "item")
          .innerJoin("item.product", "product")
          .where("product.vendorId = :vendorId", { vendorId })
          .andWhere("order.status IN (:...statuses)", {
            statuses: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.PROCESSING],
          })
          .getCount(),
      ])

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      completedOrders,
      totalRevenue,
      pendingOrders,
    }
  }

  async getVendorProducts(vendorId: string, filterDto: any = {}) {
    const { page = 1, limit = 20, search, status, sortBy = "createdAt", sortOrder = "DESC" } = filterDto

    const queryBuilder = this.productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .where("product.vendorId = :vendorId", { vendorId })

    if (search) {
      queryBuilder.andWhere("(product.name ILIKE :search OR product.description ILIKE :search)", {
        search: `%${search}%`,
      })
    }

    if (status !== undefined) {
      queryBuilder.andWhere("product.isActive = :status", { status })
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

  async getVendorOrders(vendorId: string, filterDto: any = {}) {
    const { page = 1, limit = 20, status, startDate, endDate, sortBy = "createdAt", sortOrder = "DESC" } = filterDto

    const queryBuilder = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .where("product.vendorId = :vendorId", { vendorId })

    if (status) {
      queryBuilder.andWhere("order.status = :status", { status })
    }

    if (startDate) {
      queryBuilder.andWhere("order.createdAt >= :startDate", { startDate })
    }

    if (endDate) {
      queryBuilder.andWhere("order.createdAt <= :endDate", { endDate })
    }

    queryBuilder
      .orderBy(`order.${sortBy}`, sortOrder as "ASC" | "DESC")
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

  async updateOrderStatus(vendorId: string, orderId: string, status: OrderStatus) {
    // Verify the order belongs to this vendor
    const order = await this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .where("order.id = :orderId", { orderId })
      .andWhere("product.vendorId = :vendorId", { vendorId })
      .getOne()

    if (!order) {
      throw new NotFoundException("Order not found or does not belong to vendor")
    }

    order.status = status
    return this.orderRepo.save(order)
  }
}
