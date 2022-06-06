import { Test, TestingModule } from "@nestjs/testing";
import { getEntityManagerToken, TypeOrmModule } from "@nestjs/typeorm";
import { GeneralObjectModule, incrumentIntAt } from "../src";
import { EntityManager, getConnectionOptions } from "typeorm";
import { GenericEntity } from "../src/entities/GeneralEntity";
import { TestGeneralObject, TestGeneralObjectDao } from "./setup";

describe("Generic Dao CRUD Test", () => {
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

  it("create a generic object", async () => {
    const newObj = new TestGeneralObject();
    const savedGenericObj = await dao.save(newObj);
    expect(savedGenericObj.meta.id).not.toBeNull();
    expect(savedGenericObj.meta.createdAt).not.toBeNull();
    expect(savedGenericObj.meta.updatedAt).not.toBeNull();
    expect(savedGenericObj.meta.status).not.toBeNull();
    expect(savedGenericObj.meta.typeId).toEqual(TestGeneralObject.name);
  });

  it("create null generic object", async () => {
    const newObj = new TestGeneralObject();
    const savedObj = await dao.save(newObj);
    const listedObj = await dao.listOne(savedObj.meta.id);
    expect(savedObj).toStrictEqual(listedObj);
  });

  it("save a updated generic object", async () => {
    const obj = new TestGeneralObject();
    obj.str = "123";
    obj.num = 333;
    let savedGenericObj = await dao.save(obj);
    expect(savedGenericObj.str).toStrictEqual("123");
    expect(savedGenericObj.num).toStrictEqual(333);

    const oldUpdateAt = savedGenericObj.meta.updatedAt;
    // Update the object
    savedGenericObj.str = "456";
    savedGenericObj = await dao.save(savedGenericObj);
    // Make sure object has been updated
    expect(savedGenericObj.str).toStrictEqual("456");
    // Make sure updateAt has been updated
    expect(savedGenericObj.meta.updatedAt).not.toBeLessThan(oldUpdateAt);
  });

  it("count generic objects", async () => {
    for (let i = 0; i < 10; i++) {
      const obj = new TestGeneralObject();
      obj.str = "123";
      obj.num = 333;
      await dao.save(obj);
    }
    for (let i = 0; i < 5; i++) {
      const obj = new TestGeneralObject();
      obj.str = "333";
      obj.num = 333;
      await dao.save(obj);
    }
    const cnt1 = await dao.count({ str: "333" });
    expect(cnt1).toEqual(5);

    const cnt2 = await dao.count({ str: "123" });
    expect(cnt2).toEqual(10);
  });

  it("update some generic objects", async () => {
    const obj = new TestGeneralObject();
    obj.num = 1;

    const otherObj = new TestGeneralObject();
    otherObj.deep = {
      num: 2,
    };
    const savedObj = await dao.save(obj);
    const savedOtherObj = await dao.save(otherObj);

    await dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id: savedObj.meta.id,
        },
      },
      null,
      incrumentIntAt(["num"], 1)
    );

    await dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id: savedOtherObj.meta.id,
        },
      },
      null,
      incrumentIntAt(["deep", "num"], -1)
    );

    const updatedObj = await dao.listOne(savedObj.meta.id);
    const retOtherObj = await dao.listOne(savedOtherObj.meta.id);
    // Make sure object has been updated
    expect(updatedObj.num).toStrictEqual(2);
    expect(retOtherObj.deep.num).toStrictEqual(1);
  });

  it("delete a generic object", async () => {
    const obj = new TestGeneralObject();
    const savedGenericObj = await dao.save(obj);
    await dao.deleteOne(savedGenericObj.meta.id);
    const result = await dao.listOne(savedGenericObj.meta.id);
    expect(result).toBeNull();
  });

  afterEach(async () => {
    await em.connection.close();
  });
});
