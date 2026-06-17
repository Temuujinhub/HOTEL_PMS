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
import { RoomsService } from './rooms.service';
import {
  CreateRoomDto,
  CreateRoomTypeDto,
  RoomQueryDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
  UpdateRoomTypeDto,
} from './dto/room.dto';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // Room types
  @Get('types')
  @ApiOperation({ summary: 'List room types' })
  findRoomTypes(@Query('propertyId') propertyId?: string) {
    return this.roomsService.findRoomTypes(propertyId);
  }

  @Post('types')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER)
  @ApiOperation({ summary: 'Create a room type' })
  createRoomType(@Body() dto: CreateRoomTypeDto) {
    return this.roomsService.createRoomType(dto);
  }

  @Patch('types/:id')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER)
  updateRoomType(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoomTypeDto) {
    return this.roomsService.updateRoomType(id, dto);
  }

  @Delete('types/:id')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER)
  removeRoomType(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.removeRoomType(id);
  }

  // Room rack
  @Get('rack')
  @ApiOperation({ summary: 'Visual room rack for a property' })
  roomRack(@Query('propertyId', ParseUUIDPipe) propertyId: string) {
    return this.roomsService.roomRack(propertyId);
  }

  // Rooms
  @Get()
  @ApiOperation({ summary: 'List rooms' })
  findRooms(@Query() query: RoomQueryDto) {
    return this.roomsService.findRooms(query);
  }

  @Get(':id')
  getRoom(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.getRoom(id);
  }

  @Post()
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER)
  @ApiOperation({ summary: 'Create a room' })
  createRoom(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }

  @Patch(':id')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER)
  updateRoom(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.updateRoom(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update room status (housekeeping / front desk)' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoomStatusDto) {
    return this.roomsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.GM, UserRole.FRONT_DESK_MANAGER)
  removeRoom(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.removeRoom(id);
  }
}
