import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentCallbackDto } from './payments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('callback')
  async callback(@Body() callbackDto: PaymentCallbackDto) {
    return this.paymentsService.handleCallback(callbackDto);
  }
}
