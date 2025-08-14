import { Controller, Post, Body } from '@nestjs/common';
import { PurchaseService } from './services/purchase.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private purchaseService: PurchaseService) {}

  @Post('wallet')
  async buyWithWallet(
    @Body()
    body: {
      userId: string;
      productId: string;
      quantity: number;
      totalAmount: number;
      currency?: string;
    },
  ) {
    return this.purchaseService.purchaseWithWallet(
      body.userId,
      body.productId,
      body.quantity,
      body.totalAmount,
      body.currency,
    );
  }
}
