import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  id: {type: String, required: true},
  email: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: false },
  avatar: { type: String, required: false },
  avatarHash: { type: String, required: false },
  avatarDataUrl: { type: String, required: false },
});

export interface User {
  id: string,
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  avatarHash?: string;
  avatarDataUrl?: string;
}
