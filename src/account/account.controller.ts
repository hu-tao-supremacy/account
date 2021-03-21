import { Controller } from '@nestjs/common';
import {
  AccountServiceController,
  AccountServiceControllerMethods,
  ACCOUNT_SERVICE_NAME,
  GenerateJWTResponse,
  HasPermissionRequest,
  IsAuthenticatedRequest,
} from '@internal/account/service';
import { GrpcMethod } from '@nestjs/microservices';
import { AccountService } from './account.service';
import { BoolValue } from '@google/wrappers';
import { User } from '@internal/common/common';

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

  async generateJWT(user: User): Promise<GenerateJWTResponse> {
    return null;
  }

  async hasPermission({
    userId,
    organizationId,
    permissionName,
  }: HasPermissionRequest): Promise<BoolValue> {
    return null;
  }

  ping(): BoolValue {
    return { value: true };
  }
}
