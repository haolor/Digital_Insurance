import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
} from '@nestjs/common';
import { CallbackDto, CreateContractDto, VerifyOtpDto } from './contracts.dto';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
	constructor(private readonly contractsService: ContractsService) {}

	@Post('create')
	create(@Body() createDto: CreateContractDto) {
		return this.contractsService.createFromTemplate(createDto);
	}

	@Post(':id/send-otp')
	sendOtp(@Param('id', ParseIntPipe) id: number) {
		return this.contractsService.sendOtp(id);
	}

	@Post(':id/verify')
	verify(
		@Param('id', ParseIntPipe) id: number,
		@Body() verifyDto: VerifyOtpDto,
	) {
		return this.contractsService.verifyOtp(id, verifyDto);
	}

	@Post('callback')
	callback(@Body() callbackDto: CallbackDto) {
		return this.contractsService.callback(callbackDto);
	}

	@Get(':id')
	getById(@Param('id', ParseIntPipe) id: number) {
		return this.contractsService.getById(id);
	}
}
