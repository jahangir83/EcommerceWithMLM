import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { Repository,  DataSource, Between } from "typeorm"
import { User } from "~/entity"
import type { CreateOrderDto, UpdateOrderDto, OrderFilterDto } from "./dto/order.dto"
import  { ProductsService } from "~/products/products.service"
import { Order, OrderStatus } from "./entities/order.entity"
import { OrderItem } from "./entities/order-item.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
      @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
      @InjectRepository(User)
    private userRepo: Repository<User>,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException("User not found")
    }

    return this.dataSource.transaction(async (manager) => {
      // Generate order number
      const orderNumber = await this.generateOrderNumber()

      // Create order
      const order = manager.create(Order, {
        orderNumber,
        user,
        status: OrderStatus.PENDING_PAYMENT,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress,
        notes: createOrderDto.notes,
        paymentMethod: createOrderDto.paymentMethod,
      })

      let subtotal = 0
      const orderItems: OrderItem[] = []

      // Process order items
      for (const itemDto of createOrderDto.items) {
        const product = await this.productsService.getProductById(itemDto.productId)

        if (!product) {
          throw new NotFoundException(`Product ${itemDto.productId} not found`)
        }

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`)
        }

        const unitPrice = product.salePrice > 0 ? product.salePrice : product.price
        const totalPrice = unitPrice * itemDto.quantity
        subtotal += totalPrice

        const orderItem = manager.create(OrderItem, {
          order,
          product,
          productName: product.name,
          quantity: itemDto.quantity,
          unitPrice,
          totalPrice,
          productSnapshot: {
            name: product.name,
            description: product.description,
            images: product.images,
            specifications: product.specifications,
          },
        })

        orderItems.push(orderItem)
      }

      // Calculate totals
      order.subtotalAmount = subtotal
      order.shippingAmount = createOrderDto.shippingAmount || 0
      order.taxAmount = createOrderDto.taxAmount || 0
      order.discountAmount = createOrderDto.discountAmount || 0
      order.totalAmount = subtotal + order.shippingAmount + order.taxAmount - order.discountAmount

      const savedOrder = await manager.save(order)
      order.items = await manager.save(orderItems)

      return savedOrder
    })
  }

  async findAll(userId?: string, filterDto: OrderFilterDto = {}) {
    const { page = 1, limit = 20, status, startDate, endDate, sortBy = "createdAt", sortOrder = "DESC" } = filterDto

    const queryBuilder = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")

    if (userId) {
      queryBuilder.andWhere("order.userId = :userId", { userId })
    }

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

  async findOne(id: string, userId?: string): Promise<Order> {
    const queryBuilder = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .where("order.id = :id", { id })

    if (userId) {
      queryBuilder.andWhere("order.userId = :userId", { userId })
    }

    const order = await queryBuilder.getOne()

    if (!order) {
      throw new NotFoundException("Order not found")
    }

    return order
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id)
    Object.assign(order, updateOrderDto)
    return this.orderRepo.save(order)
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id)
    order.status = status
    return this.orderRepo.save(order)
  }

  async cancel(id: string, userId?: string): Promise<Order> {
    const order = await this.findOne(id, userId)

    if (order.status !== OrderStatus.PENDING_PAYMENT && order.status !== OrderStatus.PAID) {
      throw new BadRequestException("Order cannot be cancelled")
    }

    order.status = OrderStatus.CANCELLED
    return this.orderRepo.save(order)
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    const count = await this.orderRepo.count({
      where: {
        createdAt: Between(
          new Date(year, date.getMonth(), date.getDate()),
          new Date(year, date.getMonth(), date.getDate() + 1),
        ),
      },
    })

    return `ORD-${year}${month}${day}-${String(count + 1).padStart(4, "0")}`
  }

  async getOrderStats(userId?: string) {
    const queryBuilder = this.orderRepo.createQueryBuilder("order")

    if (userId) {
      queryBuilder.where("order.userId = :userId", { userId })
    }

    const [totalOrders, pendingOrders, completedOrders, cancelledOrders, totalRevenue] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere("order.status = :status", { status: OrderStatus.PENDING_PAYMENT }).getCount(),
      queryBuilder.clone().andWhere("order.status = :status", { status: OrderStatus.COMPLETED }).getCount(),
      queryBuilder.clone().andWhere("order.status = :status", { status: OrderStatus.CANCELLED }).getCount(),
      queryBuilder
        .clone()
        .andWhere("order.status IN (:...statuses)", {
          statuses: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
        })
        .select("SUM(order.totalAmount)", "total")
        .getRawOne()
        .then((result) => Number.parseFloat(result.total) || 0),
    ])

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    }
  }
}
