import { Controller, Request, Get, Param } from '@nestjs/common';
import {
  AccountServiceController,
  AccountServiceControllerMethods,
  AssignRoleRequest,
  GenerateAccessTokenRequest,
  GenerateAccessTokenResponse,
  GetUserByChulaIdRequest,
  GetUserByEmailRequest,
  HasPermissionRequest,
  IsAuthenticatedRequest,
} from '@interchange-format/account/service';
import { AccountService } from './account.service';
import { BoolValue } from '@google/wrappers';
import { GetObjectByIdRequest, User as UserInterchangeFormat } from '@interchange-format/common/common';
import { CreateUserRequest } from '@interchange-format/account/service';
import { RpcException } from '@nestjs/microservices';
import { status } from 'grpc';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserAdapter } from '@adapters/user.adapter';
import { Permission } from '@gql/common/common';
import { Request as ExpressRequest } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from '@gql/account/service';
import { isLong } from 'long';

@Controller('account')
@AccountServiceControllerMethods()
export class AccountController implements AccountServiceController {
  constructor(private readonly accountService: AccountService, private readonly jwtService: JwtService) {}

  async isAuthenticated({ accessToken }: IsAuthenticatedRequest): Promise<BoolValue> {
    try {
      this.jwtService.verify(accessToken);
      return { value: true };
    } catch (err) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: `Access token is invalid.`,
      });
    }
  }

  updateAccountInfo(user: UserInterchangeFormat): Observable<UserInterchangeFormat> {
    const userEntity = new UserAdapter().toEntity(user);
    return this.accountService.updateUser(userEntity).pipe(map((user) => new UserAdapter().toInterchangeFormat(user)));
  }

  generateAccessToken({ userId }: GenerateAccessTokenRequest): GenerateAccessTokenResponse {
    return {
      accessToken: this.accountService.generateAccessToken(userId),
    };
  }

  @Get('getAccessToken/:userId')
  getAccessToken(@Param('userId') userId: number) {
    return this.generateAccessToken({ userId });
  }

  @Get('getIsAuthenticated')
  async getIsAuthenticated(@Request() request: ExpressRequest) {
    const accessToken = request.headers.authorization.split('Bearer ')[1];
    const isAuthenticated = await this.isAuthenticated({ accessToken });
    return isAuthenticated.value;
  }

  @Get('currentUser')
  async getCurrentUser(@Request() request: ExpressRequest) {
    const accessToken = request.headers.authorization.split('Bearer ')[1];
    const decoded = this.jwtService.decode(accessToken) as AccessTokenPayload;
    return this.getUserById({ id: decoded.userId });
  }

  async hasPermission({ userId, organizationId, permissionName }: HasPermissionRequest): Promise<BoolValue> {
    const _userId = isLong(userId) ? Number(userId.toString()) : userId;
    const _organizationId = isLong(organizationId) ? Number(organizationId.toString()) : organizationId;

    console.log(userId, organizationId, permissionName);
    console.log(_userId, _organizationId, permissionName);

    try {
      if (
        await this.accountService.userHasPermissionInOrganization(_userId, _organizationId, permissionName).toPromise()
      ) {
        return { value: true };
      }
    } catch (e) {
      console.error(e);
    }

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

  getUserByChulaId({ id }: GetUserByChulaIdRequest): Observable<UserInterchangeFormat> {
    return this.accountService.getUserByChulaId(id).pipe(map((user) => new UserAdapter().toInterchangeFormat(user)));
  }

  getUserByEmail({ email }: GetUserByEmailRequest): Observable<UserInterchangeFormat> {
    return this.accountService.getUserByEmail(email).pipe(map((user) => new UserAdapter().toInterchangeFormat(user)));
  }

  createUser(request: CreateUserRequest): Observable<UserInterchangeFormat> {
    return this.accountService
      .createUser(request.firstName, request.lastName, request.chulaId, request.email, request.isChulaStudent)
      .pipe(map((user) => new UserAdapter().toInterchangeFormat(user)));
  }

  getUserById({ id }: GetObjectByIdRequest): Observable<UserInterchangeFormat> {
    return this.accountService
      .getUserById(Number(id.toString()))
      .pipe(map((user) => new UserAdapter().toInterchangeFormat(user)));
  }

  assignRole({ userId, organizationId, role }: AssignRoleRequest): Observable<BoolValue> {
    return this.accountService.assignRole(userId, organizationId, role).pipe(map((data) => ({ value: data })));
  }

  removeRole({ userId, organizationId, role }: AssignRoleRequest): Observable<BoolValue> {
    return this.accountService.removeRole(userId, organizationId, role).pipe(map((data) => ({ value: data })));
  }
}
