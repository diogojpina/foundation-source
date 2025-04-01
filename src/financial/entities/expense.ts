import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ManagementGroup } from './management.group';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ManagementGroup, (group) => group.expenses)
  group: ManagementGroup[];

  @Column()
  name: string;

  @Column()
  amount: number;

  @ManyToOne(() => User, (payer) => payer.expensesPaid)
  payer: User;
}
