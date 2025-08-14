import { Injectable } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import { type User, type Order, type Transaction, type RevenueShare, type Product, OrderStatus } from "~/entity"

@Injectable()
export class ReportsService {
  constructor(
    private userRepo: Repository<User>,
    private orderRepo: Repository<Order>,
    private transactionRepo: Repository<Transaction>,
    private revenueShareRepo: Repository<RevenueShare>,
    private productRepo: Repository<Product>,
  ) {}

  async getSalesReport(startDate: Date, endDate: Date) {
    const orders = await this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .leftJoinAndSelect("product.category", "category")
      .where("order.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("order.status IN (:...statuses)", {
        statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
      })
      .getMany()

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Sales by category
    const salesByCategory = {}
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const categoryName = item.product.category.name
        if (!salesByCategory[categoryName]) {
          salesByCategory[categoryName] = { sales: 0, quantity: 0 }
        }
        salesByCategory[categoryName].sales += item.totalPrice
        salesByCategory[categoryName].quantity += item.quantity
      })
    })

    // Daily sales
    const dailySales = {}
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0]
      if (!dailySales[date]) {
        dailySales[date] = { sales: 0, orders: 0 }
      }
      dailySales[date].sales += order.totalAmount
      dailySales[date].orders += 1
    })

    return {
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
      },
      salesByCategory,
      dailySales,
    }
  }

  async getCommissionReport(startDate: Date, endDate: Date) {
    const commissions = await this.revenueShareRepo
      .createQueryBuilder("revenue")
      .leftJoinAndSelect("revenue.recipientUser", "recipient")
      .leftJoinAndSelect("revenue.transaction", "transaction")
      .where("revenue.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .getMany()

    const totalCommissions = commissions.reduce((sum, comm) => sum + comm.amount, 0)
    const paidCommissions = commissions
      .filter((comm) => comm.status === "paid")
      .reduce((sum, comm) => sum + comm.amount, 0)
    const pendingCommissions = commissions
      .filter((comm) => comm.status === "pending")
      .reduce((sum, comm) => sum + comm.amount, 0)

    // Commissions by level
    const commissionsByLevel = {}
    commissions.forEach((comm) => {
      const level = comm.generationLevel
      if (!commissionsByLevel[level]) {
        commissionsByLevel[level] = { total: 0, count: 0 }
      }
      commissionsByLevel[level].total += comm.amount
      commissionsByLevel[level].count += 1
    })

    // Top earners
    const earnerStats = {}
    commissions.forEach((comm) => {
      const userId = comm.recipientUser.id
      const userName = comm.recipientUser.name
      if (!earnerStats[userId]) {
        earnerStats[userId] = { name: userName, total: 0, count: 0 }
      }
      earnerStats[userId].total += comm.amount
      earnerStats[userId].count += 1
    })

    const topEarners = Object.values(earnerStats)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10)

    return {
      summary: {
        totalCommissions,
        paidCommissions,
        pendingCommissions,
        totalRecipients: Object.keys(earnerStats).length,
      },
      commissionsByLevel,
      topEarners,
    }
  }

  async getUserReport(startDate: Date, endDate: Date) {
    const newUsers = await this.userRepo.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    })

    const activeUsers = await this.userRepo.count({
      where: {
        isActive: true,
        createdAt: Between(startDate, endDate),
      },
    })

    // User registration by day
    const usersByDay = await this.userRepo
      .createQueryBuilder("user")
      .select("DATE(user.createdAt)", "date")
      .addSelect("COUNT(*)", "count")
      .where("user.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .groupBy("DATE(user.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany()

    // Users by role
    const usersByRole = await this.userRepo
      .createQueryBuilder("user")
      .select("user.role", "role")
      .addSelect("COUNT(*)", "count")
      .where("user.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .groupBy("user.role")
      .getRawMany()

    return {
      summary: {
        newUsers,
        activeUsers,
      },
      usersByDay,
      usersByRole,
    }
  }

  async getProductReport(startDate: Date, endDate: Date) {
    const topSellingProducts = await this.orderRepo
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .innerJoin("item.product", "product")
      .select("product.id", "productId")
      .addSelect("product.name", "productName")
      .addSelect("SUM(item.quantity)", "totalSold")
      .addSelect("SUM(item.totalPrice)", "totalRevenue")
      .where("order.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("order.status IN (:...statuses)", {
        statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
      })
      .groupBy("product.id, product.name")
      .orderBy("totalSold", "DESC")
      .limit(20)
      .getRawMany()

    const productsByCategory = await this.orderRepo
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .innerJoin("item.product", "product")
      .innerJoin("product.category", "category")
      .select("category.name", "categoryName")
      .addSelect("SUM(item.quantity)", "totalSold")
      .addSelect("SUM(item.totalPrice)", "totalRevenue")
      .where("order.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("order.status IN (:...statuses)", {
        statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
      })
      .groupBy("category.name")
      .orderBy("totalRevenue", "DESC")
      .getRawMany()

    return {
      topSellingProducts,
      productsByCategory,
    }
  }

  async getFinancialReport(startDate: Date, endDate: Date) {
    const revenue = await this.orderRepo
      .createQueryBuilder("order")
      .select("SUM(order.totalAmount)", "total")
      .where("order.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("order.status IN (:...statuses)", {
        statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
      })
      .getRawOne()

    const commissions = await this.revenueShareRepo
      .createQueryBuilder("revenue")
      .select("SUM(revenue.amount)", "total")
      .where("revenue.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .getRawOne()

    const transactions = await this.transactionRepo
      .createQueryBuilder("transaction")
      .select("transaction.type", "type")
      .addSelect("SUM(transaction.amount)", "total")
      .addSelect("COUNT(*)", "count")
      .where("transaction.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .groupBy("transaction.type")
      .getRawMany()

    const totalRevenue = Number.parseFloat(revenue.total) || 0
    const totalCommissions = Number.parseFloat(commissions.total) || 0
    const netRevenue = totalRevenue - totalCommissions

    return {
      summary: {
        totalRevenue,
        totalCommissions,
        netRevenue,
        commissionRate: totalRevenue > 0 ? (totalCommissions / totalRevenue) * 100 : 0,
      },
      transactionsByType: transactions,
    }
  }

  async exportReport(reportType: string, startDate: Date, endDate: Date, format = "json") {
    let data

    switch (reportType) {
      case "sales":
        data = await this.getSalesReport(startDate, endDate)
        break
      case "commission":
        data = await this.getCommissionReport(startDate, endDate)
        break
      case "users":
        data = await this.getUserReport(startDate, endDate)
        break
      case "products":
        data = await this.getProductReport(startDate, endDate)
        break
      case "financial":
        data = await this.getFinancialReport(startDate, endDate)
        break
      default:
        throw new Error("Invalid report type")
    }

    if (format === "csv") {
      // Convert to CSV format (simplified)
      return this.convertToCSV(data)
    }

    return data
  }

  private convertToCSV(data: any): string {
    // This is a simplified CSV conversion
    // In a real application, you'd want to use a proper CSV library
    const headers = Object.keys(data.summary || data)
    const values = Object.values(data.summary || data)

    return [headers.join(","), values.join(",")].join("\n")
  }
}
