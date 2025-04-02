export const environment = {
  MINIO: {
    ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    SECRET_KEY: process.env.MINIO_SECRET_KEY || 'minioadmin',
    ENDPOINT: process.env.MINIO_ENDPOINT || '127.0.0.1',
    PORT: process.env.MINIO_PORT ? +process.env.MINIO_PORT : 9000,
    BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'foundation-csv-bucket',
    USE_SSL: process.env.MINIO_USE_SSL! === 'true',
  },
};
