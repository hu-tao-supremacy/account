import { Organization } from '@entities/organization.entity';
import { UserEvent } from '@entities/user-event.entity';
import { UserInterest } from '@entities/user-interest.entity';
import { UserOrganization } from '@entities/user-organization.entity';
import { UserPermission } from '@entities/user-permission.entity';
import { User } from '@entities/user.entity';
import { AccessTokenPayload, Role } from '@api/account/service';
import { Permission } from '@api/common/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { status } from 'grpc';
import { from, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { getManager, Repository } from 'typeorm';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
    @InjectRepository(UserOrganization) private userOrganizationRepository: Repository<UserOrganization>,
    @InjectRepository(UserPermission) private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(UserInterest) private userInterestRepository: Repository<UserInterest>,
    @InjectRepository(UserEvent) private userEventRepository: Repository<UserEvent>,
    private readonly jwtService: JwtService,
  ) {}

  ping(): boolean {
    return true;
  }

  userHasPermissionInOrganization(
    userId: number,
    organizationId: number,
    permissionName: Permission,
  ): Observable<boolean> {
    return from(
      this.userOrganizationRepository.findOneOrFail({ where: { userId, organizationId }, relations: ['permissions'] }),
    ).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({
          code: status.NOT_FOUND,
          message:
            "This user's credential isn't valid for this operation. This can happen if the user isn't for the operation associated with this organizationId.",
        });
      }),
      map((userOrg) => userOrg.permissions),
      map((permissions) => permissions.findIndex((permission) => permission.permissionName == permissionName) !== -1),
    );
  }

  generateAccessToken(userId: number): string {
    const payload: AccessTokenPayload = {
      userId,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  getUserByChulaId(id: string): Observable<User> {
    return from(this.userRepository.findOneOrFail({ where: { chulaId: id } })).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({ code: status.NOT_FOUND, message: `Did not find any user for Chula ID ${id}.` });
      }),
    );
  }

  createUser(
    firstName: string,
    lastName: string,
    chulaId: string,
    email: string,
    isChulaStudent: boolean,
  ): Observable<User> {
    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.chulaId = chulaId;
    user.email = email;
    user.isChulaStudent = isChulaStudent;
    user.gender = 'NS';
    return from(this.userRepository.save(user)).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'This credential is already associated with a different user account.',
        });
      }),
    );
  }

  getUserOrgsByUserId(id: number): Observable<UserOrganization[]> {
    return from(this.userOrganizationRepository.find({ userId: id }));
  }

  getUserOrgsByOrgId(id: number): Observable<UserOrganization[]> {
    return from(this.userOrganizationRepository.find({ organizationId: id }));
  }

  getUserById(id: number): Observable<User> {
    return from(this.userRepository.findOneOrFail(id)).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({ code: status.NOT_FOUND, message: `Did not find any user for ID ${id}.` });
      }),
    );
  }

  getUserByEmail(email: string): Observable<User> {
    return from(this.userRepository.findOneOrFail({ email })).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({ code: status.NOT_FOUND, message: `Did not find any user for email ${email}.` });
      }),
    );
  }

  updateUser(user: User): Observable<User> {
    user.didSetup = true;
    return from(this.userRepository.update({ id: user.id }, user)).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'This credential is already associated with a different user account.',
        });
      }),
      switchMap((_) => from(this.userRepository.findOne(user.id))),
    );
  }

  getPermissionsFromRole(role: Role): Permission[] {
    switch (role) {
      case Role.ORGANIZATION_OWNER:
        return [
          Permission.ORGANIZATION_UPDATE,
          Permission.ORGANIZATION_REMOVE,
          Permission.ORGANIZATION_MEMBER_ADD,
          Permission.ORGANIZATION_MEMBER_REMOVE,
          Permission.TAG_CREATE,
          Permission.TAG_REMOVE,
          Permission.EVENT_CREATE,
          Permission.EVENT_UPDATE,
          Permission.EVENT_REMOVE,
          Permission.EVENT_TAG_UPDATE,
          Permission.FACILITY_CREATE,
          Permission.FACILITY_UPDATE,
          Permission.FACILITY_REMOVE,
        ];
      case Role.ORGANIZATION_EDITOR:
        return [
          Permission.ORGANIZATION_UPDATE,
          Permission.ORGANIZATION_MEMBER_ADD,
          Permission.ORGANIZATION_MEMBER_REMOVE,
          Permission.TAG_CREATE,
          Permission.TAG_REMOVE,
          Permission.EVENT_CREATE,
          Permission.EVENT_UPDATE,
          Permission.EVENT_REMOVE,
          Permission.EVENT_TAG_UPDATE,
          Permission.FACILITY_CREATE,
          Permission.FACILITY_UPDATE,
          Permission.FACILITY_REMOVE,
        ];
      case Role.ORGANIZATION_MEMBER:
        return [Permission.EVENT_CREATE, Permission.EVENT_UPDATE, Permission.EVENT_REMOVE, Permission.EVENT_TAG_UPDATE];
      default:
        return [];
    }
  }

  assignPermissions(userOrganizationId: number, permissions: Permission[]): Observable<boolean> {
    return from(
      this.userPermissionRepository.save(
        permissions.map((permission) => {
          const userPermission = new UserPermission();
          userPermission.userOrganizationId = userOrganizationId;
          userPermission.permissionName = permission;
          return userPermission;
        }),
      ),
    ).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({ code: status.INTERNAL });
      }),
      map((_) => true),
    );
  }

  removePermissions(userOrganizationId: number, permissions: Permission[]): Observable<boolean> {
    const findOptions = { where: permissions.map((permissionName) => ({ userOrganizationId, permissionName })) };
    return from(this.userPermissionRepository.find(findOptions)).pipe(
      switchMap((entities) => this.userPermissionRepository.remove(entities)),
      catchError((error) => {
        console.log(error);
        throw new RpcException({ code: status.INTERNAL });
      }),
      map((_) => true),
    );
  }

  assignRole(userId: number, organizationId: number, role: Role): Observable<boolean> {
    return from(this.userOrganizationRepository.findOneOrFail({ userId, organizationId })).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Did not find any user_organization for (user ID: ${userId}, organization ID: ${organizationId}).`,
        });
      }),
      map((userOrg) => userOrg.id),
      switchMap((userOrgId) => this.assignPermissions(userOrgId, this.getPermissionsFromRole(role))),
    );
  }

  removeRole(userId: number, organizationId: number, role: Role): Observable<boolean> {
    return from(this.userOrganizationRepository.findOneOrFail({ userId, organizationId })).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Did not find any user_organization for (user ID: ${userId}, organization ID: ${organizationId}).`,
        });
      }),
      map((userOrg) => userOrg.id),
      switchMap((userOrgId) => this.removePermissions(userOrgId, this.getPermissionsFromRole(role))),
    );
  }

  searchUser(keyword: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('CONCAT(firstName, lastName, email) LIKE :keyword LIMIT 25', { keyword })
      .getMany();
  }

  async setInterestedTags(userId: number, tagIds: number[]): Promise<boolean> {
    try {
      const user = await this.userRepository.findOneOrFail({ id: userId });
      const previousInterests = await this.userInterestRepository.find({ userId: user.id });
      const newInterests = tagIds.map((tagId) => {
        const userInterest = new UserInterest();
        userInterest.userId = user.id;
        userInterest.tagId = tagId;
        return userInterest;
      });

      await getManager().transaction(async (transactionEntityManager) => {
        await transactionEntityManager.remove(previousInterests);
        await transactionEntityManager.save(newInterests);
      });

      return true;
    } catch (error) {
      console.log(error);
      throw new RpcException({ code: status.NOT_FOUND, message: `Did not find any user for ID ${userId}.` });
    }
  }

  async setInterestedEvents(userId: number, eventIds: number[]): Promise<boolean> {
    try {
      const user = await this.userRepository.findOneOrFail({ id: userId });
      const previousInterests = await this.userEventRepository.find({ userId: user.id, isInternal: true });
      const newInterests = eventIds.map((eventId) => {
        const userEvent = new UserEvent();
        userEvent.userId = userId;
        userEvent.eventId = eventId;
        userEvent.isInternal = true;
        userEvent.status = 'APPROVED';
        return userEvent;
      });

      await getManager().transaction(async (transactionEntityManager) => {
        await transactionEntityManager.remove(previousInterests);
        await transactionEntityManager.save(newInterests);
      });

      return true;
    } catch (error) {
      console.log(error);
      throw new RpcException({ code: status.NOT_FOUND, message: `Did not find any user for ID ${userId}.` });
    }
  }
}
