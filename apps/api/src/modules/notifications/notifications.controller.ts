import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { TestNotificationDto } from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test')
  @Roles(UserRole.GM)
  @ApiOperation({ summary: 'Send a test notification (email or SMS)' })
  test(@Body() dto: TestNotificationDto) {
    if (dto.channel === 'email') {
      return this.notificationsService.sendEmail({
        to: dto.to,
        subject: dto.subject ?? '',
        body: dto.body,
      });
    }
    return this.notificationsService.sendSms({ to: dto.to, body: dto.body });
  }
}
