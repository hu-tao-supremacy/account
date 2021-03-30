import { BaseAdapter } from './base.adapter';
import { User as UserInterchangeFormat } from '@interchange-format/common/common';
import { User } from '@entities/user.entity';

export class UserAdapter extends BaseAdapter<UserInterchangeFormat, User> {
  optionalFields = ['nickname', 'chulaId', 'address', 'profilePictureUrl'];
}
