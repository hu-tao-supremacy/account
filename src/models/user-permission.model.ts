import { Model } from 'objection';
import { UserPermission } from '../apis/hts/common/common';

export class UserPermissionModel extends Model implements UserPermission {
  id: number;
  userId: number;
  permissionName: string;

  static tableName = 'user_permission';
}
