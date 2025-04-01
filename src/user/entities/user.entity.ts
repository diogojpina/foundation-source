import { Expense } from 'src/financial/entities/expense';
import { ManagementGroup } from 'src/financial/entities/management.group';
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

  @ManyToMany(() => ManagementGroup)
  managementGroups: ManagementGroup[];

  @OneToMany(() => Expense, (expense) => expense.payer)
  expensesPaid: Expense[];

  @OneToMany(() => Expense, (expense) => expense.payer)
  expensesSplited: Expense[];
}
