import { BaseAdapter } from './base.adapter';
import { UserOrganization as API } from '@api/common/common';
import { UserOrganization as Entity } from '@entities/user-organization.entity';

export class UserOrganizationAdapter extends BaseAdapter<API, Entity> {}

