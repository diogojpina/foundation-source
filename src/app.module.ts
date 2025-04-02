import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { FinancialModule } from './financial/financial.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, environment } from './config/configutation';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'sqlite',
          database: configService.get<string>('database.path'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRoot({
      connection: {
        host: environment.redis.host,
        port: environment.redis.port,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    FinancialModule,
    UserModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
