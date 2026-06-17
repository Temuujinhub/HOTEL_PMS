import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DashboardQueryDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;
}

export class RangeQueryDto {
  @ApiProperty()
  @IsUUID()
  propertyId!: string;

  @ApiPropertyOptional({ description: 'Start date (defaults to 30 days ago)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date (defaults to today)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
