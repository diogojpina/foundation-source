import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ManagementGroup } from './management.group';
import { User } from 'src/user/entities/user.entity';
import { ExpenseStatus } from '../enums/expanse.status.enum';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ManagementGroup, (group) => group.expenses)
  group: ManagementGroup;

  @Column()
  name: string;

  @Column()
  amount: number;

  @ManyToOne(() => User, (payer) => payer.expensesPaid)
  payer: User;

  @Column({ default: ExpenseStatus.OPEN })
  status: ExpenseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  settledAt?: Date;
}
