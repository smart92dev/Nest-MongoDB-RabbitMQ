import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { User } from './users.model';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  get() {
    return this.usersService.findAll();
  }

  @Post('/')
  create(@Body() user: User) {
    return this.usersService.create(user);
  }

  @Get(':userId')
  getById(@Param('userId') userId: string) {
    return this.usersService.findByUserId(userId);
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string) {
    const avatar = await this.usersService.getAvatar(userId);
    return { avatar };
  }

  @Delete(':userId')
  deleteUser(@Param('userId') userId: string): Promise<boolean> {
    return this.usersService.removeUser(userId);
  }
}
