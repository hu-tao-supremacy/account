import { BaseAdapter } from './base.adapter';
import { UserOrganization as InterchangeFormat } from '@interchange-format/common/common';
import { UserOrganization as Entity } from '@entities/user-organization.entity';

export class UserOrganizationAdapter extends BaseAdapter<InterchangeFormat, Entity> {}