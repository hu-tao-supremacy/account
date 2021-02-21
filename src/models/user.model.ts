import { Model } from 'objection';
import {
  Gender,
  Organization,
  OrganizationPermission,
  User,
} from '../apis/hts/common/common';
import { OrganizationPermissionModel } from './organization-permission.model';
import { OrganizationModel } from './organization.model';

export class UserModel extends Model implements User {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  nickname: string;
  isChulaStudent: boolean;
  chulaId: string;
  gender: Gender;

  permissions: OrganizationPermission[];
  organizations: Organization[];

  static tableName = 'user';
  static relationMappings = {
    organizations: {
      relation: Model.ManyToManyRelation,
      modelClass: OrganizationModel,
      join: {
        from: 'user.id',
        through: {
          from: 'user_organization.user_id',
          to: 'user_organization.organization_id',
        },
        to: 'organization.id',
      },
    },
    permissions: {
      relation: Model.ManyToManyRelation,
      modelClass: OrganizationPermissionModel,
      join: {
        from: 'user.id',
        through: {
          from: 'user_permission.user_id',
          to: 'user_permission.permission_id',
        },
        to: 'organization_permission.id',
      },
    },
  };
}
