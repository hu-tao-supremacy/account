import { Organization } from '@entities/organization.entity';
import { UserInterest } from '@entities/user-interest.entity';
import { UserOrganization } from '@entities/user-organization.entity';
import { UserPermission } from '@entities/user-permission.entity';
import { User } from '@entities/user.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

console.log(
  `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}$${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
);

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TypeOrmModule.forFeature([User, Organization, UserOrganization, UserPermission, UserInterest]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
