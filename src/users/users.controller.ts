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

@Controller('/users')
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

  @Get('user/:id')
  getById(@Param() params) {
    return this.usersService.findById(params.id);
  }

  @Get('user/:id/avatar')
  async getAvatar(@Param('id') id: string) {
    const avatar = await this.usersService.getAvatar(id);
    return { avatar };
  }

  @Delete('user/:id')
  deleteUser(@Param() params): Promise<boolean> {
    return this.usersService.removeUser(params.id);
  }
}
