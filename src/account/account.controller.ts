import { Controller, Get, Param } from '@nestjs/common';
import {
  AccountServiceController,
  AccountServiceControllerMethods,
  GenerateAccessTokenRequest,
  GenerateAccessTokenResponse,
  HasPermissionRequest,
  IsAuthenticatedRequest,
} from '@interchange-format/account/service';
import { AccountService } from './account.service';
import { BoolValue } from '@google/wrappers';
import { GetObjectByIdRequest, User as UserInterchangeFormat } from '@interchange-format/common/common';
import { RpcException } from '@nestjs/microservices';
import { status } from 'grpc';
import jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserAdapter } from '@adapters/user.adapter';
import { Permission } from '@gql/common/common';

@Controller('account')
@AccountServiceControllerMethods()
export class AccountController implements AccountServiceController {
  constructor(private readonly accountService: AccountService) {}

  async isAuthenticated({ accessToken }: IsAuthenticatedRequest): Promise<BoolValue> {
    try {
      jwt.verify(accessToken, process.env.JWT_SECRET);
      return { value: true };
    } catch (err) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: `Access token is invalid.`,
      });
    }
  }

  async updateAccountInfo(user: UserInterchangeFormat): Promise<UserInterchangeFormat> {
    return null;
  }

  generateAccessToken({ userId }: GenerateAccessTokenRequest): GenerateAccessTokenResponse {
    return {
      accessToken: this.accountService.generateAccessToken(userId),
    };
  }

  async hasPermission({ userId, organizationId, permissionName }: HasPermissionRequest): Promise<BoolValue> {
    try {
      if (
        await this.accountService.userHasPermissionInOrganization(userId, organizationId, permissionName).toPromise()
      ) {
        return { value: true };
      }
    } catch (_) {}

    throw new RpcException({
      code: status.PERMISSION_DENIED,
      message: `User does not have required permission to perform this action. (${permissionName})`,
    });
  }

  @Get('hasPermission/:userId/:organizationId/:permissionName')
  getHasPermission(
    @Param('userId') userId: number,
    @Param('organizationId') organizationId: number,
    @Param('permissionName') permissionName: Permission,
  ) {
    return this.hasPermission({ userId, organizationId, permissionName });
  }

  ping(): BoolValue {
    return { value: this.accountService.ping() };
  }

  getUserByChulaId({ id }: GetObjectByIdRequest): Observable<UserInterchangeFormat> {
    return this.accountService.getUserByChulaId(id).pipe(map((user) => new UserAdapter().toInterchangeFormat(user)));
  }
}
