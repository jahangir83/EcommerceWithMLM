import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type User, type Product, type Order, type Transaction, type RevenueShare, OrderStatus } from "~/entity"
import { UserRole } from "~/common/enums/role.enum"

@Injectable()
export class AdminService {
  constructor(
    private userRepo: Repository<User>,
    private productRepo: Repository<Product>,
    private orderRepo: Repository<Order>,
    private transactionRepo: Repository<Transaction>,
    private revenueShareRepo: Repository<RevenueShare>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      completedOrders,
      totalRevenue,
      pendingCommissions,
    ] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { isActive: true } }),
      this.userRepo.count({ where: { role: UserRole.VENDOR } }),
      this.productRepo.count({ where: { isActive: true } }),
      this.orderRepo.count(),
      this.orderRepo.count({ where: { status: OrderStatus.COMPLETED } }),
      this.orderRepo
        .createQueryBuilder("order")
        .where("order.status IN (:...statuses)", {
          statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
        })
        .select("SUM(order.totalAmount)", "total")
        .getRawOne()
        .then((result) => Number.parseFloat(result.total) || 0),
      this.revenueShareRepo
        .createQueryBuilder("revenue")
        .where("revenue.status = :status", { status: "pending" })
        .select("SUM(revenue.amount)", "total")
        .getRawOne()
        .then((result) => Number.parseFloat(result.total) || 0),
    ])

    return {
      totalUsers,
      activeUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      completedOrders,
      totalRevenue,
      pendingCommissions,
    }
  }

  async getRecentActivities(limit = 10) {
    const [recentUsers, recentOrders, recentProducts] = await Promise.all([
      this.userRepo.find({
        order: { createdAt: "DESC" },
        take: limit,
        select: ["id", "name", "email", "createdAt", "role"],
      }),
      this.orderRepo.find({
        relations: ["user"],
        order: { createdAt: "DESC" },
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          user: { id: true, name: true },
        },
      }),
      this.productRepo.find({
        relations: ["vendor", "category"],
        order: { createdAt: "DESC" },
        take: limit,
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
          vendor: { id: true, name: true },
          category: { id: true, name: true },
        },
      }),
    ])

    return {
      recentUsers,
      recentOrders,
      recentProducts,
    }
  }

  async getUserStats() {
    const usersByRole = await this.userRepo
      .createQueryBuilder("user")
      .select("user.role", "role")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.role")
      .getRawMany()

    const usersByMonth = await this.userRepo
      .createQueryBuilder("user")
      .select("DATE_TRUNC('month', user.createdAt)", "month")
      .addSelect("COUNT(*)", "count")
      .where("user.createdAt >= :date", { date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) })
      .groupBy("DATE_TRUNC('month', user.createdAt)")
      .orderBy("month", "ASC")
      .getRawMany()

    return {
      usersByRole,
      usersByMonth,
    }
  }

  async getOrderStats() {
    const ordersByStatus = await this.orderRepo
      .createQueryBuilder("order")
      .select("order.status", "status")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(order.totalAmount)", "total")
      .groupBy("order.status")
      .getRawMany()

    const ordersByMonth = await this.orderRepo
      .createQueryBuilder("order")
      .select("DATE_TRUNC('month', order.createdAt)", "month")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(order.totalAmount)", "total")
      .where("order.createdAt >= :date", { date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) })
      .groupBy("DATE_TRUNC('month', order.createdAt)")
      .orderBy("month", "ASC")
      .getRawMany()

    return {
      ordersByStatus,
      ordersByMonth,
    }
  }

  async getRevenueStats() {
    const revenueByMonth = await this.orderRepo
      .createQueryBuilder("order")
      .select("DATE_TRUNC('month', order.createdAt)", "month")
      .addSelect("SUM(order.totalAmount)", "revenue")
      .where("order.status IN (:...statuses)", {
        statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
      })
      .andWhere("order.createdAt >= :date", { date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) })
      .groupBy("DATE_TRUNC('month', order.createdAt)")
      .orderBy("month", "ASC")
      .getRawMany()

    const commissionsByMonth = await this.revenueShareRepo
      .createQueryBuilder("revenue")
      .select("DATE_TRUNC('month', revenue.createdAt)", "month")
      .addSelect("SUM(revenue.amount)", "commissions")
      .where("revenue.createdAt >= :date", { date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) })
      .groupBy("DATE_TRUNC('month', revenue.createdAt)")
      .orderBy("month", "ASC")
      .getRawMany()

    return {
      revenueByMonth,
      commissionsByMonth,
    }
  }

  async getTopPerformers() {
    const topVendors = await this.orderRepo
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .innerJoin("item.product", "product")
      .innerJoin("product.vendor", "vendor")
      .select("vendor.id", "vendorId")
      .addSelect("vendor.name", "vendorName")
      .addSelect("SUM(item.totalPrice)", "totalSales")
      .addSelect("COUNT(DISTINCT order.id)", "totalOrders")
      .where("order.status IN (:...statuses)", {
        statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
      })
      .groupBy("vendor.id, vendor.name")
      .orderBy("totalSales", "DESC")
      .limit(10)
      .getRawMany()

    const topProducts = await this.orderRepo
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .innerJoin("item.product", "product")
      .select("product.id", "productId")
      .addSelect("product.name", "productName")
      .addSelect("SUM(item.quantity)", "totalSold")
      .addSelect("SUM(item.totalPrice)", "totalRevenue")
      .where("order.status IN (:...statuses)", {
        statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
      })
      .groupBy("product.id, product.name")
      .orderBy("totalSold", "DESC")
      .limit(10)
      .getRawMany()

    const topReferrers = await this.userRepo
      .createQueryBuilder("user")
      .select("user.id", "userId")
      .addSelect("user.name", "userName")
      .addSelect("user.totalDirectReferrals", "directReferrals")
      .where("user.totalDirectReferrals > 0")
      .orderBy("user.totalDirectReferrals", "DESC")
      .limit(10)
      .getRawMany()

    return {
      topVendors,
      topProducts,
      topReferrers,
    }
  }
}
