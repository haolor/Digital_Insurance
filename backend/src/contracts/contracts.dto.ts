import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ContractStatus } from './contracts.entity';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  template!: string;

  @IsOptional()
  @IsString()
  contractCode?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  orderId?: number;
}

export class VerifyOtpDto {
  @IsString()
  @Length(6, 6)
  otp!: string;
}

export class CallbackDto {
  @IsNumber()
  contractId!: number;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}
