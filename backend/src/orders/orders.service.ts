import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDto } from './orders.dto';
import { Order, OrderStatus } from './orders.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly productsService: ProductsService,
  ) {}

  async create(orderDto: OrderDto): Promise<Order> {
    const product = await this.productsService.findOne(orderDto.productId);

    const order = this.ordersRepository.create({
      product: { id: orderDto.productId },
      user: { id: orderDto.userId },
      amount: product.price,
      status: OrderStatus.PENDING,
    });

    return this.ordersRepository.save(order);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({ relations: ['product', 'user'] });
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepository.save(order);
  }
}
