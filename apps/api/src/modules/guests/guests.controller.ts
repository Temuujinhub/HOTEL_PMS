import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { GuestsService } from './guests.service';
import { CreateGuestDto, UpdateGuestDto } from './dto/guest.dto';

@ApiTags('Guests')
@ApiBearerAuth()
@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  @ApiOperation({ summary: 'List guests (paginated, searchable)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.guestsService.findAll(query);
  }

  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.guestsService.getOne(id);
  }

  @Post()
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK)
  @ApiOperation({ summary: 'Create a guest' })
  create(@Body() dto: CreateGuestDto) {
    return this.guestsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER, UserRole.FRONT_DESK)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGuestDto) {
    return this.guestsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.guestsService.remove(id);
  }
}
