import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { MINIO_PROVIDER } from './minio.provider';
import { environment } from './config';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly bucketName = environment.MINIO.BUCKET_NAME;

  constructor(
    @Inject(MINIO_PROVIDER)
    private readonly minioClient: Minio.Client,
  ) {}

  async onModuleInit() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);

      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Bucket '${this.bucketName}' created sucessfuly`);
      }

      const publicPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: ['*'],
            },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify(publicPolicy),
      );
    } catch (err) {
      console.error(`Failed to init MinIO: ${err.message}`);
      throw err;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    objectName: string,
  ): Promise<string> {
    try {
      const metaData = {
        'Content-Type': file.mimetype,
      };

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        metaData,
      );

      const filePreviewUrl = this.getPublicUrl(objectName);

      return filePreviewUrl;
    } catch (err) {
      console.error(`Upload error: ${err.message}`);
      throw new Error(`Upload error: ${err.message}`);
    }
  }

  async getFile(objectName: string): Promise<NodeJS.ReadableStream> {
    try {
      return await this.minioClient.getObject(this.bucketName, objectName);
    } catch (err) {
      console.error(`Get file error: ${err.message}`);
      throw new Error(`Get file error: ${err.message}`);
    }
  }

  getPublicUrl(objectName: string): string {
    const endpoint = environment.MINIO.ENDPOINT;
    const port = environment.MINIO.PORT;
    const useSSL = environment.MINIO.USE_SSL;

    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${objectName}`;
  }
}
