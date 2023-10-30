import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import { ClientProxy } from '@nestjs/microservices';
import { createHash } from 'crypto';
import fetch from 'cross-fetch';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    // @Inject('payever') private client: ClientProxy,
  ) { }

  async create(user: User) {
    const { email } = user;
    // check user
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException(`Same email ${email} already exists`);
    }
    const newUser = await new this.userModel(user).save();
    // this.client.connect();
    return newUser;
  }

  async findByUserId(userId: string) {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    if (!response.data) {
      throw new NotFoundException(`bad request for userId ${userId}`);
    }
    return response.data.data;
  }

  async getAvatar(userId: string) {
    let user = await this.userModel.findOne({ id: userId }).exec();
    if (user && user.avatarHash) {
      return user.avatarDataUrl;
    }

    user = await this.findByUserId(userId);

    const path = `./avatars/${userId}.jpg`;
    const response = await axios.get(user.avatar, { responseType: 'arraybuffer' });
    const avatarHash = createHash('md5').update(response.data).digest('hex');
    const avatarDataUrl = `data:image/png;base64,${response.data.toString(
      'base64',
    )}`;

    await new this.userModel({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, avatar: user.avatar, avatarHash, avatarDataUrl }).save()

    // save file
    fs.writeFileSync(path, response.data);

    return avatarDataUrl;
  }

  async findAll() {
    return await this.userModel.find();
  }

  async removeUser(userId: string) {
    const path = `./avatars/${userId}.jpg`;
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
    try {
      const user = await this.userModel.findOne({ id: userId });
      user.remove();
      return true;
    } catch (error) {
      return false;
    }
  }
}
