import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ExpenseSplitStatus } from '../enums/expanse.split.status.enum';
import { Expense } from './expense';

@Entity()
export class ExpenseSplit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Expense, (expense) => expense.splits)
  expense: Expense;

  @ManyToOne(() => User, (payer) => payer.expensesSplited)
  payer: User;

  @Column()
  amount: number;

  @Column()
  percentage: number;

  @Column({ type: String, default: ExpenseSplitStatus.OPEN })
  status: ExpenseSplitStatus.OPEN | ExpenseSplitStatus.SETTLED;

  @Column({ nullable: true })
  settledAt?: Date;
}
