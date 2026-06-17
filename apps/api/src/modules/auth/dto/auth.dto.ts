import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Grand Aurora Hospitality', description: 'Business / company name' })
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @ApiProperty({ example: 'Grand Aurora Hotel', description: 'First property name' })
  @IsString()
  @IsNotEmpty()
  propertyName!: string;

  @ApiProperty({ example: 'owner@grandaurora.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Alex' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Carter' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ example: 'US', description: 'ISO 3166-1 alpha-2 country code' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'USD', description: 'ISO 4217 currency code' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'owner@grandaurora.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassw0rd!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({
    description: 'Tenant slug — required only if the same email exists in multiple businesses',
    example: 'grand-aurora-hospitality',
  })
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
