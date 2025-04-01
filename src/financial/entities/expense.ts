import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ManagementGroup } from './management.group';
import { User } from 'src/user/entities/user.entity';
import { ExpenseSplit } from './expense.split';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ManagementGroup, (group) => group.expenses)
  group: ManagementGroup;

  @Column()
  name: string;

  @Column('numeric', { precision: 7, scale: 2 })
  amount: number;

  @ManyToOne(() => User, (payer) => payer.expensesPaid)
  payer: User;

  @OneToMany(() => ExpenseSplit, (split) => split.expense, { cascade: true })
  splits: ExpenseSplit[];

  @CreateDateColumn()
  createdAt: Date;
}
