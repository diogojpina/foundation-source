import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioProvider } from './minio.provider';

@Module({
  providers: [MinioService, MinioProvider],
  exports: [MinioService],
})
export class MinioModule {}
