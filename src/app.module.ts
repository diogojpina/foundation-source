import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { FinancialModule } from './financial/financial.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FinancialModule, UserModule, AuthModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
