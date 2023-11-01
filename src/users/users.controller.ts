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
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
@Controller('api/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
  ) { }

  @Get('/')
  get() {
    return this.usersService.findAll();
  }

  @EventPattern('payever')
  // @MessagePattern('payever')  is also working
  async hello(data: Model<User>): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: "",
        pass: "",
      },
    })
    console.log(data);
    const mailOptions = {
      from: 'data.email@gmail.com',
      to: 'emeralddev92@gmail.com',
      subject: 'Hello',
      text: 'This is the body of the email'
    }
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('--', error)
      } else {
        console.log('Email Sent', info.response)
      }
    })
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
