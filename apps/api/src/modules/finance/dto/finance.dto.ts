import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FolioItemType, FolioStatus, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class AddChargeDto {
  @ApiProperty({ enum: FolioItemType, default: FolioItemType.EXTRA })
  @IsEnum(FolioItemType)
  type!: FolioItemType;

  @ApiProperty({ example: 'Minibar — Sparkling water' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: 5.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitAmount!: number;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;
}

export class AddPaymentDto {
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({ example: 100.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ description: 'stripe | adyen | qpay | manual' })
  @IsOptional()
  @IsString()
  gateway?: string;

  @ApiPropertyOptional({ description: 'Card/payment token from the client SDK' })
  @IsOptional()
  @IsString()
  token?: string;
}

export class RefundDto {
  @ApiProperty({ example: 50.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class FolioQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional({ enum: FolioStatus })
  @IsOptional()
  @IsEnum(FolioStatus)
  status?: FolioStatus;
}
