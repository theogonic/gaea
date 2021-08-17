import { Test, TestingModule } from "@nestjs/testing";
import { getEntityManagerToken, TypeOrmModule } from "@nestjs/typeorm";
import {
  concatenate,
  GeneralObjectModule,
  incrumentFloatAt,
  incrumentIntAt,
} from "../src";
import { EntityManager, getConnectionOptions } from "typeorm";
import { GenericEntity } from "../src/entities/GeneralEntity";
import { TestGeneralObject, TestGeneralObjectDao } from "./setup";

describe("Generic Dao JSONB SQL Test", () => {
  let dao: TestGeneralObjectDao;
  let em: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => {
            const optionFromEnv = await getConnectionOptions();
            const option = {
              ...optionFromEnv,
              autoLoadEntities: true,
            };
            return option;
          },
        }),
        GeneralObjectModule,
      ],
      providers: [TestGeneralObjectDao],
    }).compile();
    dao = module.get(TestGeneralObjectDao);
    expect(dao).not.toBeNull();
    em = module.get(getEntityManagerToken());
    expect(em).not.toBeNull();

    // Cleaning up the database
    await em.createQueryBuilder().delete().from(GenericEntity).execute();
  });

  it("incrumentIntAt", async () => {
    const obj = new TestGeneralObject();
    obj.num = 3;
    obj.deep.num = -1;

    const savedObj = await dao.save(obj);

    await dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id: savedObj.meta.id,
        },
      },
      null,
      incrumentIntAt(["num"], 3)
    );

    await dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id: savedObj.meta.id,
        },
      },
      null,
      incrumentIntAt(["deep", "num"], -1)
    );

    const updatedObj = await dao.listOne(savedObj.meta.id);

    // Make sure object has been updated
    expect(updatedObj.num).toStrictEqual(6);
    expect(updatedObj.deep.num).toStrictEqual(-2);
  });

  it("incrumentFloatAt", async () => {
    const obj = new TestGeneralObject();
    obj.num = 3;
    obj.deep.num = -1;

    const savedObj = await dao.save(obj);

    await dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id: savedObj.meta.id,
        },
      },
      null,
      incrumentFloatAt(["num"], 3.5)
    );

    await dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id: savedObj.meta.id,
        },
      },
      null,
      incrumentFloatAt(["deep", "num"], -1.3)
    );

    const updatedObj = await dao.listOne(savedObj.meta.id);

    // Make sure object has been updated
    expect(updatedObj.num).toBeCloseTo(6.5);
    expect(updatedObj.deep.num).toBeCloseTo(-2.3);
  });

  it("concatenate", async () => {
    const obj = new TestGeneralObject();

    const newObj = {
      str: "new me",
    };

    const savedObj = await dao.save(obj);

    await dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id: savedObj.meta.id,
        },
      },
      null,
      concatenate(newObj)
    );

    const updatedObj = await dao.listOne(savedObj.meta.id);

    // Make sure object has been updated
    expect(updatedObj.str).toEqual(newObj.str);
  });

  afterEach(async () => {
    await em.connection.close();
  });
});
