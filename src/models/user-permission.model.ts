import { Model } from 'objection';
import { UserPermission, Permission } from '../apis/hts/common/common';

export class UserPermissionModel extends Model implements UserPermission {
  id: number;
  userId: number;
  permissionName: Permission;

  static tableName = 'user_permission';
}
