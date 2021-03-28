import { AccessTokenPayload } from '@internal/account/service';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, Observable } from 'rxjs';
import { Permission } from 'src/apis/hts/common/common';
import { UserPermissionModel } from 'src/models/user-permission.model';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class AccountService {
  constructor(
    @Inject(UserModel) private readonly userModel: typeof UserModel,
    @Inject(UserPermissionModel)
    private readonly userPermissionModel: typeof UserPermissionModel,
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
    let query = await this.userPermissionModel
      .query()
      .where({ userId, organizationId, permissionName });
    return query.length === 1;
  }

  generateAccessToken(userId: number): string {
    const payload: AccessTokenPayload = {
      userId,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  getUserByChulaId(id: number): Observable<UserModel> {
    return from(this.userModel.query().findOne({ chulaId: id }));
  }
}
