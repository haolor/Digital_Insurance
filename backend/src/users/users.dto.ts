import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UserRole } from './users.entity';

export class UserDto {
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    email!: string;

    @MinLength(6)
    password!: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    password!: string;
}