import { Organization } from '@entities/organization.entity';
import { UserOrganization } from '@entities/user-organization.entity';
import { UserPermission } from '@entities/user-permission.entity';
import { User } from '@entities/user.entity';
import { AccessTokenPayload } from '@internal/account/service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { status } from 'grpc';
import { from, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Permission } from 'src/apis/hts/common/common';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
    @InjectRepository(UserOrganization) private userOrganizationRepository: Repository<UserOrganization>,
    @InjectRepository(UserPermission) private userPermission: Repository<UserPermission>,
    private readonly jwtService: JwtService,
  ) { }

  ping(): boolean {
    return true;
  }

  userHasPermissionInOrganization(
    userId: number,
    organizationId: number,
    permissionName: Permission,
  ): Observable<boolean> {
    return from(
      this.userOrganizationRepository.findOne({ where: { userId, organizationId }, relations: ['permissions'] }),
    ).pipe(
      tap((userOrg) => console.log(userOrg, permissionName)),
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
        throw new RpcException({ code: status.INTERNAL });
      }),
    );
  }

  getUserById(id: number): Observable<User> {
    return from(this.userRepository.findOneOrFail(id)).pipe(
      catchError((error) => {
        console.log(error);
        throw new RpcException({ code: status.NOT_FOUND, message: `Did not find any user for ID ${id}.` });
      }),
    );
  }

  updateUser(user: User): Observable<User> {
    user.didSetup = true
    return from(this.userRepository.update({ id: user.id }, user)).pipe(
      switchMap((_) => from(this.userRepository.findOne(user.id))),
    );
  }
}
