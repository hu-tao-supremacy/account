import { Organization as Entity } from '@entities/organization.entity';
import { Organization as API } from '@api/common/common';
import { BaseAdapter } from './base.adapter';

export class OrganizationAdapter extends BaseAdapter<API, Entity> {}
