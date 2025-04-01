export const environment = {
  database: {
    path:
      process.env.NODE_ENV === 'test'
        ? './database/test.sqlite'
        : './database/prod.sqlite',
  },
};

export function configuration() {
  return environment;
}
