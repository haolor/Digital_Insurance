import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { ProductDto } from './products.dto';
import { Product } from './products.entity';

@Injectable()
export class ProductsService {
  private readonly cacheKeyPrefix = 'product:';
  private readonly cacheListKey = 'products:list';
  private readonly cacheTtl = 600;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly cacheService: CacheService,
  ) {}

  async create(productDto: ProductDto): Promise<Product> {
    const existing = await this.productsRepository.findOne({
      where: { code: productDto.code },
    });
    if (existing) {
      throw new BadRequestException('Product code already exists');
    }

    const product = this.productsRepository.create({
      ...productDto,
      active: productDto.active ?? true,
    });

    const saved = await this.productsRepository.save(product);
    this.cacheService.set(this.cacheKeyPrefix + saved.id, saved, this.cacheTtl);
    this.cacheService.delete(this.cacheListKey);
    return saved;
  }

  async findAll(): Promise<Product[]> {
    const cached = this.cacheService.get<Product[]>(this.cacheListKey);
    if (cached) return cached;

    const products = await this.productsRepository.find();
    this.cacheService.set(this.cacheListKey, products, this.cacheTtl);
    return products;
  }

  async findOne(id: number): Promise<Product> {
    const cached = this.cacheService.get<Product>(this.cacheKeyPrefix + id);
    if (cached) return cached;

    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    this.cacheService.set(this.cacheKeyPrefix + id, product, this.cacheTtl);
    return product;
  }

  async update(id: number, productDto: ProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (productDto.code && productDto.code !== product.code) {
      const existing = await this.productsRepository.findOne({
        where: { code: productDto.code },
      });
      if (existing) {
        throw new BadRequestException('Product code already exists');
      }
    }

    Object.assign(product, productDto);
    const updated = await this.productsRepository.save(product);

    this.cacheService.set(this.cacheKeyPrefix + id, updated, this.cacheTtl);
    this.cacheService.delete(this.cacheListKey);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);

    this.cacheService.delete(this.cacheKeyPrefix + id);
    this.cacheService.delete(this.cacheListKey);
  }
}
