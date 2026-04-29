import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CallbackDto, CreateContractDto, VerifyOtpDto } from './contracts.dto';
import { Contract, ContractStatus } from './contracts.entity';

@Injectable()
export class ContractsService {
	private readonly otpTtlMs = 120_000;
	private readonly maxResend = 3;
	private readonly maxWrongAttempts = 5;
	private readonly otpStore = new Map<
		number,
		{ code: string; resendCount: number; expiresAt: number }
	>();

	constructor(
		@InjectRepository(Contract)
		private readonly contractsRepository: Repository<Contract>,
	) {}

	async createFromTemplate(createDto: CreateContractDto): Promise<Contract> {
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

		const now = Date.now();
		const existing = this.otpStore.get(contractId);
		const isExistingValid = existing && existing.expiresAt > now;
		const resendCount = isExistingValid ? existing.resendCount + 1 : 1;

		if (resendCount > this.maxResend) {
			throw new BadRequestException('Maximum OTP resend reached');
		}

		const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
		this.otpStore.set(contractId, {
			code: otpCode,
			resendCount,
			expiresAt: now + this.otpTtlMs,
		});

		contract.status = ContractStatus.OTP_SENT;
		await this.contractsRepository.save(contract);

		return {
			contractId,
			status: contract.status,
			ttlSeconds: Math.floor(this.otpTtlMs / 1000),
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

		const now = Date.now();
		const otpData = this.otpStore.get(contractId);
		if (!otpData || otpData.expiresAt <= now) {
			this.otpStore.delete(contractId);
			throw new BadRequestException('OTP expired or not found');
		}

		if (otpData.code === verifyDto.otp) {
			this.otpStore.delete(contractId);
			contract.status = ContractStatus.VERIFIED;
			contract.failedVerifyAttempts = 0;
			await this.contractsRepository.save(contract);

			return { contractId, status: contract.status };
		}

		contract.failedVerifyAttempts += 1;
		if (contract.failedVerifyAttempts > this.maxWrongAttempts) {
			contract.status = ContractStatus.LOCKED;
			this.otpStore.delete(contractId);
		}
		await this.contractsRepository.save(contract);

		return {
			contractId,
			status: contract.status,
			failedAttempts: contract.failedVerifyAttempts,
			maxWrongAttempts: this.maxWrongAttempts,
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

		return contract;
	}

	async getById(contractId: number): Promise<Contract> {
		const contract = await this.contractsRepository.findOne({ where: { id: contractId } });
		if (!contract) {
			throw new NotFoundException('Contract not found');
		}
		return contract;
	}
}
