import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_ENUM } from 'src/common/enum/queue.enum';
import { ExpenseService } from '../services/expense.service';
import { CreateExpenseDto } from '../dtos';

@Processor(QUEUE_ENUM.EXPENSE)
export class CreateExpenseConsumer extends WorkerHost {
  constructor(private readonly expenseService: ExpenseService) {
    super();
  }

  async process(job: Job<CreateExpenseDto, any, string>): Promise<any> {
    const dto = job.data;

    await this.expenseService.create(dto);
  }
}
