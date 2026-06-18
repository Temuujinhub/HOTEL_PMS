import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

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

/** Self-service kiosk: identify a booking by confirmation number + last name. */
export class KioskLookupDto {
  @ApiProperty({ example: 'CR-3F9K2A7Q' })
  @IsString()
  @IsNotEmpty()
  confirmationNo!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;
}

/** Self-service kiosk: complete check-in and issue a room key. */
export class KioskCheckInDto {
  @ApiProperty({ example: 'CR-3F9K2A7Q' })
  @IsString()
  @IsNotEmpty()
  confirmationNo!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ description: 'Chosen room; auto-assigned when omitted' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ enum: ['rfid_card', 'pin_code'], default: 'rfid_card' })
  @IsOptional()
  @IsIn(['rfid_card', 'pin_code'])
  credentialType?: 'rfid_card' | 'pin_code';

  @ApiPropertyOptional({ description: 'Passport / ID number — stored encrypted for legal registration only' })
  @IsOptional()
  @IsString()
  passportNo?: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;
}
