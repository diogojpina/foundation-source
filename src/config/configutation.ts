export const environment = {
  database: {
    path:
      process.env.NODE_ENV === 'test'
        ? './database/test.sqlite'
        : './database/prod.sqlite',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  },
};

export function configuration() {
  return environment;
}
