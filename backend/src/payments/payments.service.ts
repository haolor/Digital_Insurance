import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ContractsService } from '../contracts/contracts.service';
import { PaymentCallbackDto } from './payments.dto';
import { OrderStatus } from '../orders/orders.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly contractsService: ContractsService,
  ) {}

  async handleCallback(callbackDto: PaymentCallbackDto) {
    if (callbackDto.status === OrderStatus.PAID) {
      // 1. Update order status
      const order = await this.ordersService.updateStatus(
        callbackDto.orderId,
        OrderStatus.PAID,
      );

      // 2. Trigger create contract
      await this.contractsService.createFromTemplate({
        name: `Contract for Order #${order.id}`,
        template: 'Dear {{name}}, your contract for product {{product}} is ready.',
        userId: order.user.id.toString(),
        orderId: order.id,
      });

      // 3. console.log email
      this.logger.log(`[Email Service] Email sent to ${order.user.email} for successful payment of Order #${order.id}`);
      console.log(`[Email Service] Email sent to ${order.user.email} for successful payment of Order #${order.id}`);

      return { message: 'Payment processed successfully and contract created' };
    }

    return { message: 'Payment status updated' };
  }
}
