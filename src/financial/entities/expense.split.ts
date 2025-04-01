import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ExpenseSplit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (payer) => payer.expensesSplited)
  payer: User;

  @Column()
  amount: number;

  @Column()
  percentage: number;
}
