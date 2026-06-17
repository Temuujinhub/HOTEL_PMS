import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class PushAvailabilityDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;

  @ApiProperty({
    type: [Object],
    description: 'Availability / rate items to push to the OTA.',
  })
  @IsOptional()
  @IsArray()
  items?: unknown[];
}
