import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Organization } from "./organization.entity";
import { UserPermission } from "./user-permission.entity";
import { User } from "./user.entity";

@Index(["userId", "organizationId"], { unique: true })
@Entity()
export class UserOrganization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column()
  organizationId: number;

  @ManyToOne(() => Organization, { onDelete: "CASCADE" })
  organization: Organization;

  @OneToMany(() => UserPermission, permission => permission.userOrganization)
  permissions: UserPermission[]
}
