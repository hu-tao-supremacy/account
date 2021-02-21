import { Model } from 'objection';
import { Organization } from '../apis/hts/common/common';

export class OrganizationModel extends Model implements Organization {
  id: number;
  name: string;
  isVerified: boolean;

  static get tableName() {
    return 'organization';
  }
}
