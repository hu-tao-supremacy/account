import { Model } from 'objection';
import { Organization } from '@gql/common/common';

export class OrganizationModel extends Model implements Organization {
  id: number;
  name: string;
  isVerified: boolean;
  abbreviation: string | undefined;
  advisor: string | undefined;
  associatedFaculty: string | undefined;
  description: string | undefined;
  facebookPage: string | undefined;
  instagram: string | undefined;
  lineOfficialAccount: string | undefined;
  email: string | undefined;
  contactFullName: string | undefined;
  contactEmail: string | undefined;
  contactPhoneNumber: string | undefined;
  contactLineId: string | undefined;
  profilePictureUrl: string | undefined;
  profilePictureHash: string | undefined;

  static get tableName() {
    return 'organization';
  }
}
