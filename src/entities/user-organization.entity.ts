import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Permission } from '@onepass/graphql/common/common';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { UserPermission } from './user-permission.entity';
import { User } from './user.entity';

@InputType('UserOrganizationInput')
@ObjectType()
@Index(['userId', 'organizationId'], { unique: true })
@Entity()
export class UserOrganization {
  @Field((_) => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field((_) => Int)
  @Column()
  userId: number;

  @Field((_) => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Field((_) => Int)
  @Column()
  organizationId: number;

  @Field((_) => Organization)
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @OneToMany(() => UserPermission, (permission) => permission.userOrganization)
  permissions: UserPermission[];
}
