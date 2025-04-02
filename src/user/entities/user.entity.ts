import { Expense } from '../../financial/entities/expense';
import { ManagementGroup } from '../../financial/entities/management.group';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @ManyToMany(() => ManagementGroup)
  managementGroups: ManagementGroup[];

  @OneToMany(() => Expense, (expense) => expense.payer)
  expensesPaid: Expense[];

  @OneToMany(() => Expense, (expense) => expense.payer)
  expensesSplited: Expense[];
}
