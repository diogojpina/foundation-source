# Description

This API for splitting expenses among group members.

The API is running on [https://foundation-source.coderlab.com.br](https://foundation-source.coderlab.com.br).

## Features implementated

Management Group

- List management groups
- Get a management group
- Create management group
- Add members to a management group
- Get a balance for a management group

Expenses

- List expenses
- Get an exp
- Create expenses
- Create expenses in batch receiving an CSV file as [here](https://raw.githubusercontent.com/diogojpina/foundation-source/refs/heads/main/test/fixtures/csv/expenses.csv)
- Settle expenses splits (https://raw.githubusercontent.com/diogojpina/foundation-source/refs/heads/main/test/fixtures/csv/expenses.csv)

User

- Create user

## Detaisl

For scale optimization I'm using queues. The API adds email requests to notification queue so that notification.consumer can read the queue and send emails one by one. The API also adds expense dto to the expense queue when reads the CSV file to be processed asyncronously. Then the create.expense consumer reads the expense queue to create the expenses. This way, it doesn't hold the user waiting the API create many expenses.

I used MinIO, instead of AWS S3, because I deployed the application in a VPS server. I used the MinIO to store the CSV files. I created a library to abstract MinIO calls.

I created a mail library to mock third party email service calls. In fact, this services is logging the email to console.

I developed Unit tests and e2e tests. I added explanations to run tests in the above section.

## Technologies

- Node 20
- [NestJS 11](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [BullMQ](https://docs.bullmq.io/)
- [Jest](https://jestjs.io/)
- [csv-parser](https://www.npmjs.com/package/csv-parser)
- [class-transformer](https://www.npmjs.com/package/class-transformer)
- [class-validator](https://www.npmjs.com/package/class-validator)
- [multer](https://www.npmjs.com/package/multer)

### Service

- [sqlite3](https://www.sqlite.org/) - database
- [redis](https://redis.io/) - queue with bullmq
- [MinIO](https://min.io/) - S3 compatible API to store files (CSV)

## Documentation

You can access the live API documentation on [Swagger](https://foundation-source.coderlab.com.br/docs)

Or you can download a Postman collection on [Postman Collection](https://raw.githubusercontent.com/diogojpina/foundation-source/refs/heads/main/docs/foundation-source.postman_collection.json)

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e:management-group
$ yarn run test:e2e:expense

# test coverage
$ yarn run test:cov
```

## Deployment

We are deploying this app into [Contabo VPS](https://contabo.com/en/vps), we are using Nginx and PM2. To create a build and deploy it, you have to create an Nginx vhost to redirect requests to [PM2](https://pm2.keymetrics.io).

```bash
$ yarn build
$ cd dist
$ pm2 start main.js --name foundation-source -i max
```

Then, you have to start redis and minio into the docker-file.yaml. Inside of projects path, run and wait a few seconds to start the services.

```bash
$ docker compose up -d
```

## Stay in touch

- Author - [Diogo Pina](http://linkedin.com/in/diogojpina)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
