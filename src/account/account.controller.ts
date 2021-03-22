import { Controller } from '@nestjs/common';
import {
  AccountServiceController,
  AccountServiceControllerMethods,
  GenerateAuthTokenResponse,
  HasPermissionRequest,
  IsAuthenticatedRequest,
} from '@internal/account/service';
import { AccountService } from './account.service';
import { BoolValue } from '@google/wrappers';
import { User } from '@internal/common/common';
import { RpcException } from '@nestjs/microservices';
import grpc from 'grpc';

@Controller('account')
@AccountServiceControllerMethods()
export class AccountController implements AccountServiceController {
  constructor(private readonly accountService: AccountService) {}

  async isAuthenticated({
    accessToken,
  }: IsAuthenticatedRequest): Promise<BoolValue> {
    return { value: true };
  }

  async updateAccountInfo(user: User): Promise<User> {
    return null;
  }

  async generateAuthToken(user: User): Promise<GenerateAuthTokenResponse> {
    return null;
  }

  async hasPermission({
    userId,
    organizationId,
    permissionName,
  }: HasPermissionRequest): Promise<BoolValue> {
    if (
      await this.accountService.userHasPermissionInOrganization(
        userId,
        organizationId,
        permissionName,
      )
    ) {
      return { value: true };
    }

    throw new RpcException({
      code: grpc.status.PERMISSION_DENIED,
      message: `User does not have required permission to perform this action. (${permissionName})`,
    });
  }

  ping(): BoolValue {
    return { value: true };
  }
}
