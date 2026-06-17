import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { HousekeepingService } from './housekeeping.service';
import {
  AddPhotosDto,
  AssignDto,
  CreateHousekeepingTaskDto,
  HousekeepingQueryDto,
  UpdateStatusDto,
} from './dto/housekeeping.dto';

@ApiTags('Housekeeping')
@ApiBearerAuth()
@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'List housekeeping tasks' })
  findTasks(@Query() query: HousekeepingQueryDto) {
    return this.housekeepingService.findTasks(query);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get a housekeeping task' })
  getTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.housekeepingService.getTask(id);
  }

  @Post('tasks')
  @Roles(UserRole.HOUSEKEEPING_SUPERVISOR, UserRole.FRONT_DESK_MANAGER, UserRole.GM)
  @ApiOperation({ summary: 'Create a housekeeping task' })
  create(@Body() dto: CreateHousekeepingTaskDto) {
    return this.housekeepingService.create(dto);
  }

  @Patch('tasks/:id/assign')
  @Roles(UserRole.HOUSEKEEPING_SUPERVISOR, UserRole.GM)
  @ApiOperation({ summary: 'Assign a task to a housekeeper' })
  assign(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignDto) {
    return this.housekeepingService.assign(id, dto);
  }

  @Patch('tasks/:id/status')
  @ApiOperation({ summary: 'Transition a task status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.housekeepingService.updateStatus(id, dto, user?.userId);
  }

  @Post('tasks/:id/photos')
  @ApiOperation({ summary: 'Append photos to a task' })
  addPhotos(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddPhotosDto) {
    return this.housekeepingService.addPhotos(id, dto);
  }
}
