import { Inject, Injectable } from '@nestjs/common';
import { Permission } from 'src/apis/hts/common/common';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class AccountService {
  constructor(
    @Inject(UserModel) private readonly userModel: typeof UserModel,
  ) {}

  async ping(): Promise<string> {
    let query = await this.userModel.knex().raw('SELECT VERSION()');
    return query.rows[0].version as string;
  }

  async userHasPermissionInOrganization(
    userId: number,
    organizationId: number,
    permissionName: Permission,
  ): Promise<boolean> {
    let query = await this.userModel
      .query()
      .where({ userId, organizationId, permissionName });
    return query.length === 1;
  }
}
