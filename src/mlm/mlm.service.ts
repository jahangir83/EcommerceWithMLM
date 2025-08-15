import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { User, RevenueShare, Transaction, LeaderShipDisignation } from "~/entity"

@Injectable()
export class MlmService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RevenueShare)
    private revenueShareRepo: Repository<RevenueShare>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(LeaderShipDisignation)
    private leadershipRepo: Repository<LeaderShipDisignation>,
  ) {}

  async getNetworkTree(userId: string, levels = 3): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ["referrals"],
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const buildTree = async (currentUser: User, currentLevel: number): Promise<any> => {
      if (currentLevel >= levels) {
        return {
          id: currentUser.id,
          name: currentUser.username,
          level: currentLevel,
          directReferrals: currentUser.totalDirectReferrals,
          isActive: currentUser.isActive,
          joinedAt: currentUser.createdAt,
        }
      }

      const referrals = await this.userRepo.find({
        where: { referredById: currentUser.id },
        relations: ["referrals"],
      })

      const children = await Promise.all(referrals.map((referral) => buildTree(referral, currentLevel + 1)))

      return {
        id: currentUser.id,
        name: currentUser.username,
        level: currentLevel,
        directReferrals: currentUser.totalDirectReferrals,
        isActive: currentUser.isActive,
        joinedAt: currentUser.createdAt,
        children,
      }
    }

    const tree = await buildTree(user, 0)
    const totalNetwork = await this.getTotalNetworkSize(userId)

    return {
      user: {
        id: user.id,
        name: user.username,
        level: 0,
        directReferrals: user.totalDirectReferrals,
        totalNetwork,
      },
      network: tree.children || [],
    }
  }

  async getTotalNetworkSize(userId: string): Promise<number> {
    // This is a simplified version. In a real implementation, you might want to use a recursive CTE
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) return 0

    let totalSize = 0
    const visited = new Set<string>()
    const queue = [userId]

    while (queue.length > 0) {
      const currentUserId = queue.shift()!
      if (visited.has(currentUserId)) continue
      visited.add(currentUserId)

      const referrals = await this.userRepo.find({
        where: { referredById: currentUserId },
      })

      totalSize += referrals.length
      referrals.forEach((referral) => queue.push(referral.id))
    }

    return totalSize
  }

  async getCommissionHistory(userId: string, filterDto: any = {}) {
    const { page = 1, limit = 20, startDate, endDate, level, status } = filterDto

    const queryBuilder = this.revenueShareRepo
      .createQueryBuilder("revenue")
      .leftJoinAndSelect("revenue.recipientUser", "recipient")
      .leftJoinAndSelect("revenue.transaction", "transaction")
      .leftJoinAndSelect("revenue.orderItem", "orderItem")
      .where("revenue.recipientUserId = :userId", { userId })

    if (startDate) {
      queryBuilder.andWhere("revenue.createdAt >= :startDate", { startDate })
    }

    if (endDate) {
      queryBuilder.andWhere("revenue.createdAt <= :endDate", { endDate })
    }

    if (level) {
      queryBuilder.andWhere("revenue.generationLevel = :level", { level })
    }

    if (status) {
      queryBuilder.andWhere("revenue.status = :status", { status })
    }

    queryBuilder
      .orderBy("revenue.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)

    const [items, total] = await queryBuilder.getManyAndCount()

    // Calculate summary
    const summaryQuery = this.revenueShareRepo
      .createQueryBuilder("revenue")
      .where("revenue.recipientUserId = :userId", { userId })

    const [totalCommissions, paidCommissions, pendingCommissions] = await Promise.all([
      summaryQuery.clone().select("SUM(revenue.amount)", "total").getRawOne(),
      summaryQuery
        .clone()
        .andWhere("revenue.status = :status", { status: "paid" })
        .select("SUM(revenue.amount)", "total")
        .getRawOne(),
      summaryQuery
        .clone()
        .andWhere("revenue.status = :status", { status: "pending" })
        .select("SUM(revenue.amount)", "total")
        .getRawOne(),
    ])

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalCommissions: Number.parseFloat(totalCommissions.total) || 0,
        paidCommissions: Number.parseFloat(paidCommissions.total) || 0,
        pendingCommissions: Number.parseFloat(pendingCommissions.total) || 0,
      },
    }
  }

  async getLeadershipInfo(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException("User not found")
    }

    const currentLevel = await this.leadershipRepo.findOne({
      where: { id: user.leadershipId },
    })

    const nextLevel = await this.leadershipRepo.findOne({
      where: { id: user.leadershipId + 1 },
    })

    const totalNetworkSize = await this.getTotalNetworkSize(userId)
    const personalSales = await this.getPersonalSales(userId)

    let progress = {}
    if (nextLevel && nextLevel.target) {
      progress = await this.calculateProgress(userId, nextLevel.target)
    }

    return {
      currentLevel: currentLevel || {
        id: 0,
        name: "New Member",
        description: "Welcome to the platform",
        requirements: {},
        benefits: {},
      },
      nextLevel,
      progress,
      stats: {
        directReferrals: user.totalDirectReferrals,
        totalNetwork: totalNetworkSize,
        personalSales,
      },
    }
  }

  private async getPersonalSales(userId: string): Promise<number> {
    const result = await this.transactionRepo
      .createQueryBuilder("transaction")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.type = :type", { type: "purchase" })
      .andWhere("transaction.status = :status", { status: "COMPLETED" })
      .select("SUM(transaction.amount)", "total")
      .getRawOne()

    return Number.parseFloat(result.total) || 0
  }

  private async calculateProgress(userId: string, targets: any[]): Promise<any> {
    const progress = {}

    for (const target of targets) {
      let current = 0
      const required = Number.parseFloat(target.value)

      switch (target.targetName) {
        case "directReferrals":
          const user = await this.userRepo.findOne({ where: { id: userId } })
          current = user?.totalDirectReferrals || 0
          break
        case "teamSize":
          current = await this.getTotalNetworkSize(userId)
          break
        case "personalSales":
          current = await this.getPersonalSales(userId)
          break
      }

      progress[target.targetName] = {
        current,
        required,
        percentage: required > 0 ? Math.min((current / required) * 100, 100) : 0,
      }
    }

    return progress
  }

  async getTeamStats(userId: string) {
    const directReferrals = await this.userRepo.count({
      where: { referredById: userId },
    })

    const activeReferrals = await this.userRepo.count({
      where: { referredById: userId, isActive: true },
    })

    const totalNetwork = await this.getTotalNetworkSize(userId)

    const teamSales = await this.getTeamSales(userId)

    return {
      directReferrals,
      activeReferrals,
      totalNetwork,
      teamSales,
    }
  }

  private async getTeamSales(userId: string): Promise<number> {
    // Get all team members
    const teamMembers = await this.getAllTeamMembers(userId)

    if (teamMembers.length === 0) return 0

    const result = await this.transactionRepo
      .createQueryBuilder("transaction")
      .where("transaction.userId IN (:...userIds)", { userIds: teamMembers })
      .andWhere("transaction.type = :type", { type: "purchase" })
      .andWhere("transaction.status = :status", { status: "COMPLETED" })
      .select("SUM(transaction.amount)", "total")
      .getRawOne()

    return Number.parseFloat(result.total) || 0
  }

  private async getAllTeamMembers(userId: string): Promise<string[]> {
    const members: string[] = []
    const visited = new Set<string>()
    const queue = [userId]

    while (queue.length > 0) {
      const currentUserId = queue.shift()!
      if (visited.has(currentUserId)) continue
      visited.add(currentUserId)

      const referrals = await this.userRepo.find({
        where: { referredById: currentUserId },
        select: ["id"],
      })

      referrals.forEach((referral) => {
        members.push(referral.id)
        queue.push(referral.id)
      })
    }

    return members
  }
}
