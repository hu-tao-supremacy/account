import { Controller } from '@nestjs/common';
import {
  AccountServiceController,
  AccountServiceControllerMethods,
  GenerateAccessTokenResponse,
  HasPermissionRequest,
  IsAuthenticatedRequest,
} from '@internal/account/service';
import { AccountService } from './account.service';
import { BoolValue } from '@google/wrappers';
import { GetObjectByIdRequest, User } from '@internal/common/common';
import { RpcException } from '@nestjs/microservices';
import grpc from 'grpc';
import jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('account')
@AccountServiceControllerMethods()
export class AccountController implements AccountServiceController {
  constructor(private readonly accountService: AccountService) {}

  async isAuthenticated({
    accessToken,
  }: IsAuthenticatedRequest): Promise<BoolValue> {
    try {
      let decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      return { value: true };
    } catch (err) {
      throw new RpcException({
        code: grpc.status.UNAUTHENTICATED,
        message: `Access token is invalid.`,
      });
    }

    return { value: true };
  }

  async updateAccountInfo(user: User): Promise<User> {
    return null;
  }

  async generateAccessToken(user: User): Promise<GenerateAccessTokenResponse> {
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

  async ping(): Promise<BoolValue> {
    if ((await this.accountService.ping()).length > 0) {
      return { value: true };
    }

    return { value: false };
  }

  getUserByChulaId({ id }: GetObjectByIdRequest): Observable<User> {
    return this.accountService.getUserByChulaId(id).pipe(
      map((userModel) => {
        const user: User = {
          id: userModel.id,
          firstName: userModel.firstName,
          lastName: userModel.lastName,
          email: userModel.email,
          nickname: { value: userModel.nickname },
          chulaId: { value: userModel.chulaId },
          isChulaStudent: userModel.isChulaStudent,
          gender: userModel.gender,
          address: { value: userModel.address },
          profilePictureUrl: { value: userModel.profilePictureUrl },
        };

        return user;
      }),
    );
  }
}
