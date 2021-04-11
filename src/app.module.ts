import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '@entities/organization.entity';
import { User } from '@entities/user.entity';
import { UserOrganization } from '@entities/user-organization.entity';
import { UserPermission } from '@entities/user-permission.entity';
import { UserInterest } from '@entities/user-interest.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Tag } from '@entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Organization, UserOrganization, UserPermission, Tag, UserInterest],
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    AccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
