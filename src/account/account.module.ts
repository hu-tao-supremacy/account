import { Module } from '@nestjs/common';
import { ObjectionModule } from '@willsoto/nestjs-objection';
import { UserModel } from 'src/models/user.model';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

console.log(
  `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}$${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
);

@Module({
  imports: [
    ObjectionModule.register({
      config: {
        client: 'pg',
        useNullAsDefault: true,
        connection: {
          host: process.env.POSTGRES_HOST,
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          port: Number(process.env.POSTGRES_PORT),
          database: process.env.POSTGRES_DB,
        },
      },
    }),
    ObjectionModule.forFeature([UserModel]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
