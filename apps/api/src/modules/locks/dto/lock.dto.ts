import { ApiProperty } from '@nestjs/swagger';
import { LockProvider } from '@prisma/client';
import { IsEnum, IsIn, IsISO8601, IsUUID } from 'class-validator';
import { LockCredentialType } from '../lock.types';

export class CreateCredentialDto {
  @ApiProperty()
  @IsUUID()
  reservationId!: string;

  @ApiProperty()
  @IsUUID()
  roomId!: string;

  @ApiProperty({ enum: LockProvider })
  @IsEnum(LockProvider)
  lockProvider!: LockProvider;

  @ApiProperty({ example: '2026-06-17T14:00:00.000Z' })
  @IsISO8601()
  checkIn!: string;

  @ApiProperty({ example: '2026-06-20T12:00:00.000Z' })
  @IsISO8601()
  checkOut!: string;

  @ApiProperty({ enum: ['digital_key', 'rfid_card', 'pin_code'] })
  @IsIn(['digital_key', 'rfid_card', 'pin_code'])
  credentialType!: LockCredentialType;
}
