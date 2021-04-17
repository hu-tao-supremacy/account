import { Controller, Request, Get, Param } from '@nestjs/common';
import {
  AccountServiceController,
  AccountServiceControllerMethods,
  AssignRoleRequest,
  GenerateAccessTokenRequest,
  GenerateAccessTokenResponse,
  GetUserByChulaIdRequest,
  GetUserByEmailRequest,
  GetUserOrganizationsByOrganizationIdResponse,
  GetUserOrganizationsByUserIdResponse,
  HasPermissionRequest,
  IsAuthenticatedRequest,
  SetInterestedEventsRequest,
  SetInterestedTagsRequest,
  CreateUserRequest,
  AccessTokenPayload,
  SearchUserRequest,
  SearchUserResponse,
} from '@api/account/service';
import { Permission, GetObjectByIdRequest, User as UserInterchangeFormat } from '@api/common/common';
import { AccountService } from './account.service';
import { BoolValue } from '@google/wrappers';
import { RpcException } from '@nestjs/microservices';
import { status } from 'grpc';
import { from, Observable } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { UserAdapter } from '@adapters/user.adapter';
import { Request as ExpressRequest } from 'express';
import { JwtService } from '@nestjs/jwt';
import { isLong } from 'long';
import { UserOrganizationAdapter } from '@adapters/user-organization.adapter';

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

  searchUser({ keyword }: SearchUserRequest): Observable<SearchUserResponse> {
    return from(this.accountService.searchUser(keyword)).pipe(
      map((users) => users.map((user) => new UserAdapter().toInterchangeFormat(user))),
      map((users) => ({ users })),
    );
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

  @Get('searchUser/:keyword')
  getSearchUser(@Param('keyword') keyword: string) {
    return this.searchUser({ keyword });
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

  setInterestedTags({ userId, tagIds }: SetInterestedTagsRequest): Observable<UserInterchangeFormat> {
    return from(this.accountService.setInterestedTags(userId, tagIds)).pipe(
      switchMap((_) => this.accountService.getUserById(userId)),
      map((user) => new UserAdapter().toInterchangeFormat(user)),
    );
  }

  setInterestedEvents({ userId, eventIds }: SetInterestedEventsRequest): Observable<UserInterchangeFormat> {
    return from(this.accountService.setInterestedEvents(userId, eventIds)).pipe(
      switchMap((_) => this.accountService.getUserById(userId)),
      map((user) => new UserAdapter().toInterchangeFormat(user)),
    );
  }

  getUserOrganizationsByOrganizationId({
    id,
  }: GetObjectByIdRequest): Observable<GetUserOrganizationsByOrganizationIdResponse> {
    return this.accountService.getUserOrgsByOrgId(id).pipe(
      map((userOrgs) => userOrgs.map((userOrg) => new UserOrganizationAdapter().toInterchangeFormat(userOrg))),
      map((userOrgs) => ({ userOrganizations: userOrgs })),
    );
  }

  getUserOrganizationsByUserId({ id }: GetObjectByIdRequest): Observable<GetUserOrganizationsByUserIdResponse> {
    return this.accountService.getUserOrgsByUserId(id).pipe(
      map((userOrgs) => userOrgs.map((userOrg) => new UserOrganizationAdapter().toInterchangeFormat(userOrg))),
      map((userOrgs) => ({ userOrganizations: userOrgs })),
    );
  }
}
