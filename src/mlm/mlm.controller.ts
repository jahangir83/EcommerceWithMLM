import { Controller, Get, Post, Body, Param, UseGuards, Query } from "@nestjs/common"
import { MlmService } from "./mlm.service"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger"

@ApiTags("MLM")
@Controller("mlm")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class MlmController {
  constructor(private readonly mlmService: MlmService) {}

  @Get("network")
  @ApiOperation({ summary: "Get user MLM network structure" })
  @ApiResponse({
    status: 200,
    description: "Network structure retrieved successfully",
    schema: {
      example: {
        user: {
          id: 1,
          name: "John Doe",
          level: 1,
          totalReferrals: 25,
          directReferrals: 5,
        },
        downline: [
          {
            id: 2,
            name: "Jane Smith",
            level: 2,
            joinDate: "2024-01-15",
            totalEarnings: 500.0,
            children: [],
          },
        ],
        stats: {
          totalNetworkSize: 25,
          totalCommissions: 1250.0,
          monthlyCommissions: 150.0,
          rank: "Silver",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getNetwork(req) {
    // return this.mlmService.getNetworkStructure(req.user.id)
  }

  @Get("commissions")
  @ApiOperation({ summary: "Get user commission history" })
  @ApiQuery({ name: "page", required: false, description: "Page number", example: 1 })
  @ApiQuery({ name: "limit", required: false, description: "Items per page", example: 10 })
  @ApiQuery({ name: "type", required: false, description: "Commission type filter" })
  @ApiResponse({
    status: 200,
    description: "Commission history retrieved successfully",
    schema: {
      example: {
        data: [
          {
            id: 1,
            amount: 50.0,
            type: "DIRECT_REFERRAL",
            description: "Commission from direct referral purchase",
            fromUser: "Jane Smith",
            date: "2024-01-15T10:30:00Z",
            status: "PAID",
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
        summary: {
          totalEarned: 2500.0,
          thisMonth: 150.0,
          pending: 25.0,
        },
      },
    },
  })
  getCommissions(req, @Query('page') page?: number, @Query('limit') limit?: number, @Query('type') type?: string) {
    return this.mlmService.getCommissionHistory(req.user.id, {
      page: page || 1,
      limit: limit || 10,
      type,
    })
  }

  @Get("ranks")
  @ApiOperation({ summary: "Get MLM rank information and requirements" })
  @ApiResponse({
    status: 200,
    description: "Rank information retrieved successfully",
    schema: {
      example: {
        currentRank: {
          name: "Silver",
          level: 2,
          benefits: ["5% bonus commission", "Monthly rewards"],
          requirements: {
            directReferrals: 5,
            networkSize: 25,
            monthlyVolume: 1000,
          },
        },
        nextRank: {
          name: "Gold",
          level: 3,
          requirements: {
            directReferrals: 10,
            networkSize: 50,
            monthlyVolume: 2500,
          },
          progress: {
            directReferrals: "5/10",
            networkSize: "25/50",
            monthlyVolume: "1200/2500",
          },
        },
        allRanks: [
          {
            name: "Bronze",
            level: 1,
            requirements: { directReferrals: 3, networkSize: 10 },
          },
        ],
      },
    },
  })
  getRanks(req) {
    // return this.mlmService.getRankInformation(req.user.id)
  }

  @Post("calculate-commission")
  @ApiOperation({ summary: "Calculate potential commission for a purchase" })
  @ApiResponse({
    status: 200,
    description: "Commission calculation completed",
    schema: {
      example: {
        purchaseAmount: 100.0,
        commissions: [
          {
            userId: 1,
            level: 1,
            percentage: 10,
            amount: 10.0,
            type: "DIRECT_REFERRAL",
          },
          {
            userId: 2,
            level: 2,
            percentage: 5,
            amount: 5.0,
            type: "INDIRECT_REFERRAL",
          },
        ],
        totalCommission: 15.0,
      },
    },
  })
  calculateCommission(req, @Body() body: { purchaseAmount: number; productId?: number }) {
    // return this.mlmService.calculateCommission(req.user.id, body.purchaseAmount, body.productId)
  }

  @Get('genealogy/:userId')
  @ApiOperation({ summary: 'Get genealogy tree for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID to get genealogy for' })
  @ApiResponse({ 
    status: 200, 
    description: 'Genealogy tree retrieved successfully',
    schema: {
      example: {
        root: {
          id: 1,
          name: 'John Doe',
          joinDate: '2024-01-01',
          level: 1,
          children: [
            {
              id: 2,
              name: 'Jane Smith',
              joinDate: '2024-01-15',
              level: 2,
              totalVolume: 500.00,
              children: []
            }
          ]
        },
        stats: {
          totalLevels: 5,
          totalMembers: 25,
          activeMembers: 20
        }
      }
    }
  })
  getGenealogy(@Param('userId') userId: string) {
    // return this.mlmService.getGenealogy(+userId);
  }

  @Get("performance")
  @ApiOperation({ summary: "Get MLM performance analytics" })
  @ApiQuery({ name: "period", required: false, description: "Time period (week, month, year)", example: "month" })
  @ApiResponse({
    status: 200,
    description: "Performance analytics retrieved successfully",
    schema: {
      example: {
        period: "month",
        metrics: {
          newReferrals: 5,
          totalCommissions: 250.0,
          networkGrowth: 15,
          rankProgress: 75,
          topPerformers: [
            {
              name: "Jane Smith",
              commissions: 100.0,
              referrals: 3,
            },
          ],
        },
        charts: {
          commissionsOverTime: [
            { date: "2024-01-01", amount: 50.0 },
            { date: "2024-01-15", amount: 75.0 },
          ],
          networkGrowth: [
            { date: "2024-01-01", count: 20 },
            { date: "2024-01-15", count: 25 },
          ],
        },
      },
    },
  })
  getPerformance(req, @Query('period') period?: string) {
    // return this.mlmService.getPerformanceAnalytics(req.user.id, period || "month")
  }
}
