import { Model } from 'objection';
import { UserPermission } from '../apis/hts/common/common';

export class UserPermissionModel extends Model implements UserPermission {
  id: number;
  userId: number;
  organizationPermissionId: number;

  static tableName = 'user_permission';
}
