import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CallbackDto, CreateContractDto, VerifyOtpDto } from './contracts.dto';
import { Contract, ContractStatus } from './contracts.entity';
import { CacheService } from '../cache/cache.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class ContractsService {
	private readonly logger = new Logger(ContractsService.name);

	constructor(
		@InjectRepository(Contract)
		private readonly contractsRepository: Repository<Contract>,
		private readonly cacheService: CacheService,
	) {}

	async createFromOrder(createDto: CreateContractDto): Promise<Contract> {
		const content = createDto.template.replaceAll('{{name}}', createDto.name);
		const contractCode =
			createDto.contractCode ?? `CT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		const createData: DeepPartial<Contract> = {
			contractCode,
			content,
			status: ContractStatus.PENDING,
		};

		if (createDto.userId) {
			createData.user = { id: createDto.userId } as DeepPartial<Contract['user']>;
		}

		if (createDto.orderId) {
			createData.order = { id: createDto.orderId } as DeepPartial<Contract['order']>;
		}

		const created = this.contractsRepository.create(createData);

		return this.contractsRepository.save(created);
	}

	async sendOtp(contractId: number) {
		const contract = await this.contractsRepository.findOne({ where: { id: contractId } });
		if (!contract) {
			throw new NotFoundException('Contract not found');
		}
		if (contract.status === ContractStatus.LOCKED) {
			throw new BadRequestException('Contract is locked');
		}

		const otpKey = `otp:${contractId}`;
		const existing = this.cacheService.get<{ code: string; resendCount: number }>(otpKey);
		const resendCount = existing ? existing.resendCount + 1 : 1;

		if (resendCount > 3) {
			throw new BadRequestException('Maximum OTP resend reached');
		}

		const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
		this.cacheService.set(otpKey, { code: otpCode, resendCount }, 120);

		contract.status = ContractStatus.OTP_SENT;
		await this.contractsRepository.save(contract);

		return {
			contractId,
			status: contract.status,
			ttlSeconds: 120,
			resendCount,
			otpCode,
		};
	}

	async verifyOtp(contractId: number, verifyDto: VerifyOtpDto) {
		const contract = await this.contractsRepository.findOne({ where: { id: contractId } });
		if (!contract) {
			throw new NotFoundException('Contract not found');
		}
		if (contract.status === ContractStatus.LOCKED) {
			throw new BadRequestException('Contract is locked');
		}

		const otpKey = `otp:${contractId}`;
		const otpData = this.cacheService.get<{ code: string }>(otpKey);
		if (!otpData) {
			throw new BadRequestException('OTP expired or not found');
		}

		if (otpData.code === verifyDto.otp) {
			this.cacheService.delete(otpKey);
			contract.status = ContractStatus.VERIFIED;
			contract.failedVerifyAttempts = 0;
			await this.contractsRepository.save(contract);

			return { contractId, status: contract.status };
		}

		contract.failedVerifyAttempts += 1;
		if (contract.failedVerifyAttempts > 5) {
			contract.status = ContractStatus.LOCKED;
			this.cacheService.delete(otpKey);
		}
		await this.contractsRepository.save(contract);

		return {
			contractId,
			status: contract.status,
			failedAttempts: contract.failedVerifyAttempts,
			maxWrongAttempts: 5,
		};
	}

	async callback(callbackDto: CallbackDto) {
		const contract = await this.contractsRepository.findOne({
			where: { id: callbackDto.contractId },
		});
		if (!contract) {
			throw new NotFoundException('Contract not found');
		}

		contract.status = callbackDto.status ?? ContractStatus.SIGNED;
		contract.signedAt = new Date();
		await this.contractsRepository.save(contract);

		this.logger.log(`[EFY Callback] Contract #${contract.id} signed successfully via EFY`);
		console.log(`[EFY Callback] Contract #${contract.id} signed successfully via EFY`);

		return contract;
	}

	async getById(contractId: number): Promise<Contract> {
		const contract = await this.contractsRepository.findOne({
			where: { id: contractId },
			relations: ['user', 'order', 'order.product'],
		});
		if (!contract) {
			throw new NotFoundException('Contract not found');
		}
		return contract;
	}

	async findAll(): Promise<Contract[]> {
		return this.contractsRepository.find({
			relations: ['user', 'order', 'order.product'],
			order: { createdAt: 'DESC' },
		});
	}

	async findByUser(userId: string): Promise<Contract[]> {
		return this.contractsRepository.find({
			where: { user: { id: userId } },
			relations: ['order', 'order.product'],
			order: { createdAt: 'DESC' },
		});
	}
}
