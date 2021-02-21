import { Controller } from '@nestjs/common';
import { Result } from '../apis/hts/common/common';
import {
  AccountServiceController,
  AccountServiceControllerMethods,
  ACCOUNT_SERVICE_NAME,
  GenerateJWTRequest,
  HasPermissionRequest,
  InvalidateJWTRequest,
  IsAuthenticatedRequest,
  UpdateAccountInfoRequest,
  UpdateAccountInfoResponse,
} from '../apis/hts/account/service';
import { GrpcMethod } from '@nestjs/microservices';
import { AccountService } from './account.service';

@Controller('account')
@AccountServiceControllerMethods()
export class AccountController implements AccountServiceController {
  constructor(private readonly accountService: AccountService) {}

  async isAuthenticated(request: IsAuthenticatedRequest): Promise<Result> {
    const version = await this.accountService.ping();
    return { isOk: true, description: version };
  }

  updateAccountInfo(
    request: UpdateAccountInfoRequest,
  ): UpdateAccountInfoResponse {
    let ret: UpdateAccountInfoResponse = { user: undefined };
    return ret;
  }

  generateJWT(request: GenerateJWTRequest): Result {
    return { isOk: true, description: null };
  }

  invalidateJWT(request: InvalidateJWTRequest): Result {
    return { isOk: true, description: null };
  }

  @GrpcMethod(ACCOUNT_SERVICE_NAME, 'GenerateJWT')
  generateJwt(request: GenerateJWTRequest): Result {
    return { isOk: true, description: null };
  }

  @GrpcMethod(ACCOUNT_SERVICE_NAME, 'InvalidateJWT')
  invalidateJwt(request: InvalidateJWTRequest): Result {
    return { isOk: true, description: null };
  }

  async hasPermission(request: HasPermissionRequest): Promise<Result> {
    let result = this.accountService.userHasPermissionInOrganization(
      request.userId,
      request.organizationId,
      request.permissionName,
    );
    console.log(result);
    return { isOk: true, description: null };
  }
}
