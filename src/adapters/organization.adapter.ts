import { Organization } from '@entities/organization.entity';
import { Organization as OrganizationIF } from '@interchange-format/common/common';
import { BaseAdapter } from './base.adapter';

export class OrganizationAdapter extends BaseAdapter<
  OrganizationIF,
  Organization
> {
  wrapperTypeFields = [
    'abbreviation',
    'advisor',
    'associatedFaculty',
    'description',
    'facebookPage',
    'instagram',
    'lineOfficialAccount',
    'email',
    'contactFullName',
    'contactEmail',
    'contactPhoneNumber',
    'contactLineId',
    'profilePictureUrl',
    'profilePictureHash',
  ];
}
