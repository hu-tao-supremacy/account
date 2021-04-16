import { BaseAdapter } from './base.adapter';
import { User as API } from '@api/common/common';
import { User as Entity } from '@entities/user.entity';

export class UserAdapter extends BaseAdapter<API, Entity> {}
