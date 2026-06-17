import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/tenant.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current tenant' })
  getCurrent() {
    return this.tenantsService.getCurrent();
  }

  @Patch('me')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update the current tenant' })
  updateCurrent(@Body() dto: UpdateTenantDto) {
    return this.tenantsService.updateCurrent(dto);
  }

  @Get('me/subscription')
  @ApiOperation({ summary: 'Get the current tenant subscription' })
  getSubscription() {
    return this.tenantsService.getSubscription();
  }
}
