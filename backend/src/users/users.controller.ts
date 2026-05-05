import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UserDto, LoginDto } from './users.dto';
import { UnauthorizedException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: UserDto) {
    return this.usersService.createUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.usersService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }


  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('sales')
  findSales() {
    return this.usersService.findSalesStaff();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUser(id);
  }
}