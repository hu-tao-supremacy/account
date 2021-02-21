import { Model } from 'objection';
import { UserOrganization } from '../apis/hts/common/common';

export class UserOrganizationModel extends Model implements UserOrganization {
  id: number;
  userId: number;
  organizationId: number;

  static get tableName() {
    return 'user_organization';
  }
}
