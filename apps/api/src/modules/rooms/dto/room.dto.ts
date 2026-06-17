import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LockProvider, RoomStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateRoomTypeDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;

  @ApiProperty({ example: 'Deluxe King' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'DLX-K' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 120.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baseRate!: number;

  @ApiPropertyOptional({ default: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxOccupancy?: number;

  @ApiPropertyOptional({ default: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxAdults?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxChildren?: number;

  @ApiPropertyOptional({ example: 'King' })
  @IsOptional()
  @IsString()
  bedType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeSqm?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  amenities?: string[];
}

export class UpdateRoomTypeDto extends PartialType(CreateRoomTypeDto) {}

export class CreateRoomDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;

  @ApiProperty()
  @IsUUID()
  roomTypeId!: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  roomNumber!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number;

  @ApiPropertyOptional({ enum: LockProvider, default: LockProvider.NONE })
  @IsOptional()
  @IsEnum(LockProvider)
  lockProvider?: LockProvider;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lockDeviceId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSmoking?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baseRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxOccupancy?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  features?: Record<string, unknown>;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

export class UpdateRoomStatusDto {
  @ApiProperty({ enum: RoomStatus })
  @IsEnum(RoomStatus)
  status!: RoomStatus;
}

export class RoomQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional({ enum: RoomStatus })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number;
}
