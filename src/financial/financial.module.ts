import { Module } from '@nestjs/common';
import { FinancialController } from './controllers/financial.controller';
import { FinancialService } from './services/financial.service';

@Module({
  controllers: [FinancialController],
  providers: [FinancialService],
})
export class FinancialModule {}
