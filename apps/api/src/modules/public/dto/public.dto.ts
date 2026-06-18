import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class PublicAvailabilityQueryDto {
  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2026-07-05' })
  @IsDateString()
  checkOutDate!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;
}

export class PublicBookingDto {
  @ApiProperty()
  @IsUUID()
  roomTypeId!: string;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2026-07-05' })
  @IsDateString()
  checkOutDate!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialRequests?: string;
}

export class LookupQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;
}
