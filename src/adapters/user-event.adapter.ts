import { BaseAdapter } from './base.adapter';
import { UserEvent as UserEventIF } from '@interchange-format/common/common';
import { UserEvent } from '@entities/user-event.entity';

export class UserEventAdapter extends BaseAdapter<UserEventIF, UserEvent> {
  optionalFields = ['rating', 'ticket', 'isInternal'];
}
