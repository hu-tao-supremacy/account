import { BaseAdapter } from './base.adapter';
import { UserEvent as API } from '@api/common/common';
import { UserEvent as Entity } from '@entities/user-event.entity';

export class UserEventAdapter extends BaseAdapter<API, Entity> {
  constructor() {
    super(API);
  }
}
