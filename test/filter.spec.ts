import { Test, TestingModule } from "@nestjs/testing";
import { getEntityManagerToken, TypeOrmModule } from "@nestjs/typeorm";
import { GeneralObjectModule } from "../src";
import { EntityManager, getConnectionOptions } from "typeorm";
import { GenericEntity } from "../src/entities/GeneralEntity";
import { TestGeneralObject, TestGeneralObjectDao } from "./setup";
import { v4 as uuidv4 } from "uuid";

describe("Generic Dao Filter Test", () => {
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

  it("list a general object", async () => {
    const newObj1 = new TestGeneralObject();
    const newObj2 = new TestGeneralObject();
    const newObj3 = new TestGeneralObject();

    newObj1.numArr = [5, 6];
    newObj3.numArr = [1, 2, 3];

    await dao.save(newObj1);
    await dao.save(newObj2);

    const savedObj3 = await dao.save(newObj3);

    const res = await dao.listOneByFilter(null, {
      objectJsonPathPredicts: ["$.numArr[*] ? (@ == 1)"],
    });

    expect(res).toStrictEqual(savedObj3);
  });

  it("list some generic objects", async () => {
    const newObj1 = new TestGeneralObject();
    const newObj2 = new TestGeneralObject();
    const newObj3 = new TestGeneralObject();
    const newObj4 = new TestGeneralObject();

    newObj1.strArr = ["e"];
    newObj2.strArr = ["b", "e"];
    newObj3.strArr = ["c"];
    newObj4.strArr = [];
    const savedObj1 = await dao.save(newObj1);
    const savedObj2 = await dao.save(newObj2);
    const savedObj3 = await dao.save(newObj3);
    const savedObj4 = await dao.save(newObj4);
    expect(savedObj1.strArr).toEqual(newObj1.strArr);
    expect(savedObj2.strArr).toEqual(newObj2.strArr);
    expect(savedObj3.strArr).toEqual(newObj3.strArr);
    expect(savedObj4.strArr).toEqual(newObj4.strArr);

    const res = await dao.list(
      {
        limit: 4,
      },
      null,
      {
        objectJsonPathPredicts: ['$ ? (@.strArr[*] == "e")'],
      }
    );

    expect(res.items.length).toEqual(2);
    expect(res.items).toContainEqual(savedObj1);
    expect(res.items).toContainEqual(savedObj2);
  });

  it("list by full text search", async () => {
    const newObj1 = new TestGeneralObject();
    const newObj2 = new TestGeneralObject();
    const newObj3 = new TestGeneralObject();
    const newObj4 = new TestGeneralObject();

    newObj1.strArr = ["e", "gaea"];
    newObj1.str = "hello1";
    newObj2.strArr = ["b", "e"];
    newObj3.strArr = ["c"];
    newObj3.str = "hello1";
    newObj4.strArr = [];
    const savedObj1 = await dao.save(newObj1);
    const savedObj2 = await dao.save(newObj2);
    const savedObj3 = await dao.save(newObj3);
    const savedObj4 = await dao.save(newObj4);

    const res = await dao.list(null, null, {
      objectFullText: "hello1",
    });

    expect(res.items.length).toEqual(2);
    expect(res.items).toContainEqual(savedObj1);
    expect(res.items).toContainEqual(savedObj3);
  });

  it("list by full text search 2", async () => {
    const newObj1 = new TestGeneralObject();
    const newObj2 = new TestGeneralObject();
    const newObj3 = new TestGeneralObject();
    const newObj4 = new TestGeneralObject();

    newObj1.strArr = ["e", "gaea"];
    newObj1.str = "hello1";
    newObj2.strArr = ["b", "e"];
    newObj3.strArr = ["c"];
    newObj3.str = "hello1";
    newObj4.strArr = [];
    const savedObj1 = await dao.save(newObj1);
    const savedObj2 = await dao.save(newObj2);
    const savedObj3 = await dao.save(newObj3);
    const savedObj4 = await dao.save(newObj4);

    const res = await dao.list(null, null, {
      objectFullText: "gaea",
    });

    expect(res.items.length).toEqual(1);
    expect(res.items).toContainEqual(savedObj1);
    //expect(res.items).toContainEqual(savedObj3);
  });

  it("list by raw where", async () => {
    const newObj1 = new TestGeneralObject({ userId: uuidv4() });
    const newObj2 = new TestGeneralObject();
    const newObj3 = new TestGeneralObject();
    const newObj4 = new TestGeneralObject();

    newObj1.strArr = ["e", "gaea"];
    newObj1.str = "hello1";
    newObj2.strArr = ["b", "gaea"];
    newObj3.strArr = ["c"];
    newObj3.str = "hello1";
    newObj4.strArr = [];
    const savedObj1 = await dao.save(newObj1);
    const savedObj2 = await dao.save(newObj2);
    const savedObj3 = await dao.save(newObj3);
    const savedObj4 = await dao.save(newObj4);

    const res = await dao.list(null, null, {
      rawWhere: (alias) => {
        return `${alias}.userId = '${newObj1.meta.userId}' AND ${alias}.object->'strArr' ?| array['gaea', 'c']`;
      },
    });

    expect(res.items.length).toEqual(1);
    expect(res.items).toContainEqual(savedObj1);
    //expect(res.items).toContainEqual(savedObj3);
  });

  afterEach(async () => {
    await em.connection.close();
  });
});
