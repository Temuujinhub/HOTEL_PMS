import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { DashboardQueryDto, RangeQueryDto } from './dto/analytics.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Real-time operational dashboard (Occupancy, ADR, RevPAR)' })
  dashboard(@Query() query: DashboardQueryDto) {
    return this.analyticsService.dashboard(query.propertyId);
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Occupancy timeline + period ADR / RevPAR' })
  occupancy(@Query() query: RangeQueryDto) {
    return this.analyticsService.occupancy(query.propertyId, query.from, query.to);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue by day and by channel' })
  revenue(@Query() query: RangeQueryDto) {
    return this.analyticsService.revenue(query.propertyId, query.from, query.to);
  }
}
