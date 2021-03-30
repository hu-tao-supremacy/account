import { Controller } from '@nestjs/common';
import {
  AccountServiceController,
  AccountServiceControllerMethods,
  GenerateAccessTokenRequest,
  GenerateAccessTokenResponse,
  HasPermissionRequest,
  IsAuthenticatedRequest,
} from '@internal/account/service';
import { AccountService } from './account.service';
import { BoolValue } from '@google/wrappers';
import { GetObjectByIdRequest, User as UserInterchangeFormat } from '@interchange-format/common/common';
import { RpcException } from '@nestjs/microservices';
import grpc from 'grpc';
import jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserAdapter } from '@adapters/user.adapter';

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
        code: grpc.status.UNAUTHENTICATED,
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
    if (await this.accountService.userHasPermissionInOrganization(userId, organizationId, permissionName).toPromise()) {
      return { value: true };
    }

    throw new RpcException({
      code: grpc.status.PERMISSION_DENIED,
      message: `User does not have required permission to perform this action. (${permissionName})`,
    });
  }

  ping(): BoolValue {
    return { value: this.accountService.ping() };
  }

  getUserByChulaId({ id }: GetObjectByIdRequest): Observable<UserInterchangeFormat> {
    return this.accountService.getUserByChulaId(id).pipe(map((user) => new UserAdapter().toInterchangeFormat(user)));
  }
}
