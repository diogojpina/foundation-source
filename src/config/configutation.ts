export const environment = {
  database: {
    path:
      process.env.NODE_ENV === 'test'
        ? './database/test.sqlite'
        : './database/project-mark.sqlite',
  },
};

export function configuration() {
  return environment;
}
