import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import { ClientProxy } from '@nestjs/microservices';
import { createHash } from 'crypto';
import fetch from 'cross-fetch';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @Inject('payever') private client: ClientProxy,
  ) {}

  async create(user: User) {
    user.avatar && (await new this.userModel(user).save());
    this.client.connect();
    return true;
  }

  async findById(id: string) {
    return await this.userModel.findById(id).exec();
  }

  async getAvatar(id: string) {
    const user = await this.userModel.findById(id).select('avatar').exec();
    return this.findAvatarById(user.id, user.avatar);
  }

  async findAll() {
    return await this.userModel.find();
  }

  async removeUser(id: string) {
    return !!(await this.userModel.findByIdAndRemove(id));
  }

  async findAvatarById(userId: string, avatarUrl: string): Promise<string> {
    const existingUser = await this.userModel.findById(userId);
    if (existingUser && existingUser.avatarHash) {
      return existingUser.avatarDataUrl;
    }

    const imageResponse = await fetch(avatarUrl);
    const imageBuffer = await this.streamToBuffer(imageResponse.body);
    const avatarHash = createHash('md5').update(imageBuffer).digest('hex');
    const avatarDataUrl = `data:image/png;base64,${imageBuffer.toString(
      'base64',
    )}`;
    await this.userModel.findByIdAndUpdate(userId, {
      avatarHash,
      avatarDataUrl,
    });

    return avatarDataUrl;
  }

  async streamToBuffer(stream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
