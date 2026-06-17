import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TestNotificationDto {
  @ApiProperty({ enum: ['email', 'sms'] })
  @IsIn(['email', 'sms'])
  channel!: 'email' | 'sms';

  @ApiProperty({ example: 'guest@example.com' })
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiPropertyOptional({ description: 'Required for email.' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;
}
