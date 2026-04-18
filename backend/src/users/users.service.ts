import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './users.entity';
import { UserDto } from './users.dto';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  
  async createUser(userDto: UserDto) {
    const exist = await this.usersRepository.findOne({ where: { email: userDto.email } });
    if (exist) {
      throw new BadRequestException('Email already in use');
    }
    const user = this.usersRepository.create({
      ...userDto,
      password: await hash(userDto.password, this.saltRounds),
    });
    return this.usersRepository.save(user);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, userDto: UserDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (userDto.email && userDto.email !== user.email) {
      throw new BadRequestException('Email cannot be updated');
    }
    Object.assign(user, {
      ...userDto,
      password: await hash(userDto.password, this.saltRounds),
    });
    return this.usersRepository.save(user);
  }
  
  async deleteUser(id: string){
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.remove(user);
  }

  async findAll() {
    return this.usersRepository.find();
  }
  
  

}