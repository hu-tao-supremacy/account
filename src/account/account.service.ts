import { Organization } from '@entities/organization.entity';
import { UserOrganization } from '@entities/user-organization.entity';
import { UserPermission } from '@entities/user-permission.entity';
import { User } from '@entities/user.entity';
import { AccessTokenPayload } from '@internal/account/service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
      this.userOrganizationRepository.findOne({ where: { userId, organizationId }, relations: ['permissions'] }),
    ).pipe(
      map((userOrg) => userOrg.permissions),
      map((permissions) => permissions.findIndex((permission) => permission.permissionName === permissionName) !== -1),
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

  getUserByChulaId(id: number): Observable<User> {
    return from(this.userRepository.findOne({ where: { chulaId: id } }));
  }
}
