import { User } from '@gql/common/common';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Permission } from 'src/apis/hts/common/common';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class AccountService {
  constructor(
    @Inject(UserModel) private readonly userModel: typeof UserModel,
    private readonly jwtService: JwtService,
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

  async generateAccessToken(user: User): string {
    const payload: any = {
      userId: user.id,
      organizationId: user.email,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }
}
