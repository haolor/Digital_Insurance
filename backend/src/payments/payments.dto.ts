import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { OrderStatus } from '../orders/orders.entity';

export class PaymentCallbackDto {
  @IsNumber()
  @IsNotEmpty()
  orderId!: number;

  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status!: OrderStatus;
}
