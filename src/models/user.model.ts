import { Model } from 'objection';
import {
  Gender,
  Organization,
  User,
  Permission,
} from '../apis/hts/common/common';
import { OrganizationModel } from './organization.model';

export class UserModel
  extends Model
  implements
    Omit<User, 'nickname' | 'chulaId' | 'address' | 'profilePictureUrl'> {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  nickname: string;
  isChulaStudent: boolean;
  chulaId: string;
  gender: Gender;
  address?: string;
  profilePictureUrl?: string;

  permissions: Permission[];
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
  };
}
