import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderDto {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
