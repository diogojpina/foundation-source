import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TestUtil {
  constructor(private readonly dataSource: DataSource) {}

  async loadDb() {
    const entities = await this.getEntities();
    for (const entity of entities) {
      const entityFile = path.join(
        __dirname,
        `../fixtures/entity/${entity.name}.json`,
      );
      if (fs.existsSync(entityFile)) {
        const data = JSON.parse(fs.readFileSync(entityFile, 'utf8'));
        try {
          const repository = this.dataSource.getRepository(entity.name);

          await repository
            .createQueryBuilder(entity.name)
            .insert()
            .values(data)
            .execute();
        } catch (e) {
          console.log(e);
          console.log(`Failed to load ${entity.name}`);
        }
      }
    }
  }

  async cleanDb() {
    const entities = await this.getEntities();

    for (const entity of entities) {
      try {
        const repository = this.dataSource.getRepository(entity.name);
        await repository.query(`DELETE FROM ${entity.tableName} `);
        await repository.query(
          `DELETE FROM SQLITE_SEQUENCE WHERE name='${entity.tableName}' `,
        );
      } catch (error) {
        throw new Error(`ERROR: Cleaning db: ${error}`);
      }
    }
  }

  public getEntities() {
    const entities: any = [];
    this.dataSource.entityMetadatas.forEach((x) =>
      entities.push({ name: x.name, tableName: x.tableName }),
    );
    return entities;
  }

  public async realodDb() {
    try {
      await this.cleanDb();
      await this.loadDb();
    } catch (err) {
      console.log('err', err);
      throw err;
    }
  }
}
