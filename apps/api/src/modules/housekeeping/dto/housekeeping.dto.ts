import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  HousekeepingPriority,
  HousekeepingStatus,
  HousekeepingType,
} from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateHousekeepingTaskDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;

  @ApiProperty()
  @IsUUID()
  roomId!: string;

  @ApiProperty({ enum: HousekeepingType })
  @IsEnum(HousekeepingType)
  type!: HousekeepingType;

  @ApiPropertyOptional({ enum: HousekeepingPriority, default: HousekeepingPriority.NORMAL })
  @IsOptional()
  @IsEnum(HousekeepingPriority)
  priority?: HousekeepingPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: HousekeepingStatus })
  @IsEnum(HousekeepingStatus)
  status!: HousekeepingStatus;
}

export class AssignDto {
  @ApiProperty()
  @IsUUID()
  assignedToId!: string;
}

export class AddPhotosDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  photos!: string[];
}

export class HousekeepingQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional({ enum: HousekeepingStatus })
  @IsOptional()
  @IsEnum(HousekeepingStatus)
  status?: HousekeepingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  roomId?: string;
}
