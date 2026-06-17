import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationChannel, ReservationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class GuestInputDto {
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
}

export class CreateReservationDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;

  @ApiProperty()
  @IsUUID()
  roomTypeId!: string;

  @ApiPropertyOptional({ description: 'Assign a specific room now (optional)' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ratePlanId?: string;

  @ApiPropertyOptional({ description: 'Existing guest id; omit to create a new guest from `guest`' })
  @IsOptional()
  @IsUUID()
  guestId?: string;

  @ApiPropertyOptional({ type: GuestInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GuestInputDto)
  guest?: GuestInputDto;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2026-07-05' })
  @IsDateString()
  checkOutDate!: string;

  @ApiPropertyOptional({ enum: ReservationChannel, default: ReservationChannel.DIRECT })
  @IsOptional()
  @IsEnum(ReservationChannel)
  channel?: ReservationChannel;

  @ApiPropertyOptional({ enum: ReservationStatus, default: ReservationStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

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

  @ApiPropertyOptional({ description: 'Override nightly rate; defaults to rate plan / room type rate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ratePerNight?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateReservationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckInDto {
  @ApiPropertyOptional({ description: 'Room to assign at check-in (required if not yet assigned)' })
  @IsOptional()
  @IsUUID()
  roomId?: string;
}

export class CancelReservationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AvailabilityQueryDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  roomTypeId?: string;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2026-07-05' })
  @IsDateString()
  checkOutDate!: string;
}

export class ReservationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ enum: ReservationChannel })
  @IsOptional()
  @IsEnum(ReservationChannel)
  channel?: ReservationChannel;

  @ApiPropertyOptional({ description: 'Filter: arrivals from this date' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter: arrivals until this date' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
