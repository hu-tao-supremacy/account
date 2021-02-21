import { Model } from 'objection';
import { OrganizationPermission, Permission } from '../apis/hts/common/common';

export class OrganizationPermissionModel
  extends Model
  implements OrganizationPermission {
  id: number;
  organizationId: number;
  permission: Permission;

  static tableName = 'organization_permission';
}
