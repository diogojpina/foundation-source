import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  public async sendEmail(
    to: string,
    subject: string,
    message: any,
  ): Promise<boolean> {
    console.log(`sending message to: ${to} (${subject})`);
    console.log('message', message);
    return await Promise.resolve(true);
  }
}
