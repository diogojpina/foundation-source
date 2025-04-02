import { MailService } from '@app/mail';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_ENUM } from '../../common/enum/queue.enum';
import { EmailDto } from '../dtos/email/email.dto';

@Processor(QUEUE_ENUM.NOTIFICATION)
export class NotificationConsumer extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<EmailDto, any, string>): Promise<any> {
    const dto = job.data;

    await this.mailService.sendEmail(dto.to, dto.subject, dto.mesage);
  }
}
