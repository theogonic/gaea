import { Logger } from "@nestjs/common";
import {
  DeleteQueryBuilder,
  EntityManager,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from "typeorm";
import { GenericEntity } from "./entities/GeneralEntity";
import {
  GeneralObject,
  GeneralObjectDao,
  GeneralObjectFilter,
  GeneralObjectKeyPathType,
  GeneralObjectOrderBy,
  Pagination,
  PaginatedOutput,
  AdvancedGeneralObjectFilter,
} from "./types";
import { InvalidGeneralObject, MismatchedGeneralObjectType } from "./errors";
import { GeneralObjectMeta } from "./generated/types";
import { InjectEntityManager } from "@nestjs/typeorm";

export abstract class BaseGeneralObjectDao<
  T extends GeneralObject = GeneralObject
> implements GeneralObjectDao<T>
{
  private readonly logger = new Logger(
    Object.getPrototypeOf(this).constructor.name
  );

  protected repo: Repository<GenericEntity>;
  protected target: new (...args) => T = null;
  constructor(@InjectEntityManager() protected em: EntityManager) {
    this.repo = em.getRepository(GenericEntity);
  }

  /**
   * Return a generic object with given conditions.
   * @param filter Generic object filter.
   */
  async listOneByFilter(
    filter: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter
  ): Promise<T> {
    const qb = this.repo.createQueryBuilder("d");
    this.applyFilter(qb, "d", filter, advancedFilter);
    const entity = await qb.getOne();
    return this.getObjectFromEntity(entity);
  }

  /**
   * Get a general object by given user ID.
   * @param userId
   * @returns
   */
  async listOneByUserId(userId: string): Promise<T> {
    const currTypeId = (this.target as any).typeId;
    const entity = await this.repo.findOne({
      where: { userId, typeId: currTypeId },
    });
    return this.getObjectFromEntity(entity);
  }

  /**
   * Create a new dao with same EntityManager.
   * @param daoTarget Constructor of the Dao
   */
  forkDao<G extends new (...args: any[]) => GeneralObjectDao<GeneralObject>>(
    daoTarget: G
  ): InstanceType<G> {
    const newDao = new daoTarget(this.em);
    return newDao as any;
  }

  /**
   * To check is given object a valid generic object
   * 1. Property metadata has to be existed.
   * 2. If genericObjectTypeId has been set, gObject's typeId has be the same.
   * @param gObject Object going to be checked
   */
  protected validateGenericObject(gObject: Readonly<T>): void {
    const { meta } = gObject;
    if (!meta) {
      throw new InvalidGeneralObject(
        `no meta in ${JSON.stringify(gObject, null, 2)}`
      );
    }
    if (this.target && (this.target as any).id) {
      const currTypeId = (this.target as any).typeId;
      if (currTypeId && meta.typeId != currTypeId) {
        throw new MismatchedGeneralObjectType(currTypeId, meta.typeId);
      }
    }
  }

  /**
   * Create or update an generic object into database
   * @param gObject Object going to be created or updated
   */
  async save(gObject: Readonly<T>): Promise<T> {
    this.validateGenericObject(gObject);
    const entity = this.getEntityFromObject(gObject);
    const savedEntity = await this.repo.save(entity);
    return this.getObjectFromEntity(savedEntity);
  }

  /**
   * Delete a generic object from database
   * @param id ID of a generic object going to be deleted
   */
  async deleteOne(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  /**
   * List one generic object with given ID.
   * @param id
   */
  async listOne(id: string): Promise<T> {
    const entity = await this.repo.findOne({
      where: {
        id,
      },
    });
    return this.getObjectFromEntity(entity);
  }

  /**
   * Execute a function within a database transaction
   * @param fn Function that going to execute a series of operation in one database transaction
   */
  transaction<R>(fn: (dao: GeneralObjectDao<T>) => Promise<R>): Promise<R> {
    return this.em.transaction(async (trx) => {
      // Getting self constructor
      const constructor = this.constructor as unknown as FunctionConstructor;
      // Create a new instance of Dao
      const trxDaoSvc = new constructor(
        trx as any
      ) as unknown as GeneralObjectDao<T>;
      return fn(trxDaoSvc);
    });
  }

  async count(
    filter?: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter
  ): Promise<number> {
    const qb = this.repo.createQueryBuilder("d");
    this.applyFilter(qb, "d", filter, advancedFilter);
    return qb.getCount();
  }

  /**
   * Returns a list of generic object with given condition
   * @param request Request to list generic object
   */
  async list(
    pagination: Pagination,
    filter?: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter,
    orderBy?: GeneralObjectOrderBy
  ): Promise<PaginatedOutput<T>> {
    const qb = this.repo.createQueryBuilder("d");
    this.applyFilter(qb, "d", filter, advancedFilter);
    this.applyOrderBy(qb, "d", orderBy);
    this.applyPagination(qb, pagination);

    const pagedResult = await qb.getManyAndCount();
    const [items, totalCount] = pagedResult;

    let newNextToken = null;
    const offset =
      pagination && pagination.nextToken
        ? parseInt(pagination.nextToken, 10)
        : 0;
    const limit = pagination && pagination.limit ? pagination.limit : 20;
    if (items.length + offset < totalCount) {
      newNextToken = `${offset + limit}`;
    }
    return {
      totalCount,
      items: items.map(this.getObjectFromEntity.bind(this)),
      nextToken: newNextToken,
    };
  }

  /**
   * Update a/many generic object(s) with given condition
   * @param request Request to update a/many generic object(s)
   */
  async batchUpdateWithRawJsonbSql(
    filter?: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter,
    rawObjectSql?: string
  ): Promise<void> {
    const alias = null;
    const qb = this.repo.createQueryBuilder(alias).update();
    this.applyFilter(qb, alias, filter, advancedFilter);

    qb.set({
      object: () => rawObjectSql,
    } as any);

    await qb.execute();
  }

  /**
   * Delete a/many generic object(s) with given condition
   * @param request Request to delete a/many generic object(s)
   */
  async batchDelete(
    filter?: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter
  ): Promise<void> {
    const alias = "d";
    const qb = this.repo.createQueryBuilder(alias).delete();
    this.applyFilter(qb, alias, filter, advancedFilter);

    await qb.execute();
  }

  /**
   * Create a new instnace of generic entity from generic object
   * @param gObject Generic object going to be used
   */
  private getEntityFromObject(gObject: Partial<T>): GenericEntity {
    const [meta, obj] = this.destructGeneralObject(gObject);
    const entity = new GenericEntity();
    // createdAt and updatedAt will be took care by TypeORM and PostgreSQL
    entity.id = meta.id;
    entity.status = meta.status;
    entity.userId = meta.userId;
    entity.object = obj as never;
    entity.typeId = meta.typeId;
    if (meta.createdAt) {
      entity.createdAt = new Date(meta.createdAt);
    }
    if (meta.updatedAt) {
      entity.updatedAt = new Date(meta.updatedAt);
    }
    return entity;
  }

  /**
   * Create a new instance of generic object from a generic entity
   * @param entity Generic entity going to be used
   */
  private getObjectFromEntity(entity: GenericEntity): T {
    if (!entity) {
      return null;
    }
    return {
      meta: {
        id: entity.id,
        typeId: entity.typeId,
        userId: entity.userId,
        status: entity.status,
        createdAt: entity.createdAt?.valueOf(),
        updatedAt: entity.updatedAt?.valueOf(),
      },
      ...(entity.object as Record<string, null>),
    } as unknown as T;
  }

  /**
   * Add a pagination into query builder
   * @param qb Query builder going to be added pagination
   * @param pagination Pagination
   */
  private applyPagination(
    qb: SelectQueryBuilder<GenericEntity>,
    pagination?: Pagination
  ): void {
    if (pagination) {
      const offset = pagination.nextToken
        ? parseInt(pagination.nextToken, 10)
        : 0;
      qb.offset(offset);
      if (pagination.limit) {
        qb.limit(pagination.limit);
      }
    }
  }

  /**
   * Add order-by into query builder
   * @param qb Query builder going to be added order-by
   * @param alias Database table alias
   * @param orderBy Order-by condition
   */
  private applyOrderBy(
    qb: SelectQueryBuilder<GenericEntity>,
    alias = "d",
    orderBy: GeneralObjectOrderBy
  ): void {
    if (!orderBy) {
      qb.orderBy(`${alias}.created_at`, "DESC");
      return;
    }

    if (!orderBy.keyPath || orderBy.keyPath.length == 0) {
      throw new Error("orderBy.keyPath");
    }

    switch (orderBy.keyPathType) {
      case GeneralObjectKeyPathType.MetadataKey: {
        const key = orderBy.keyPath[0];
        qb.orderBy(`${alias}.${key}`, orderBy.order);
        break;
      }
      case GeneralObjectKeyPathType.ObjectKey: {
        const pgKeyPath = this.getPglJsonbKeyPath(orderBy.keyPath);
        qb.orderBy(`${alias}.object#>'${pgKeyPath}'`, orderBy.order);
        break;
      }
      default: {
        this.logger.error(
          `Unknown GenericObjectKeyPathType ${orderBy.keyPath}`
        );
      }
    }
  }

  private getAliasedProp(prop: string, alias?: string) {
    return alias ? `${alias}.${prop}` : prop;
  }

  private destructGeneralObject(
    go: Partial<T>
  ): [Partial<GeneralObjectMeta>, Omit<T, "meta">] {
    if (!go) {
      return [null, null];
    }

    const { meta, ...obj } = go;
    return [meta, obj as any];
  }

  /**
   * Add filters into query builder
   * @param qb Query builder going to be added filters
   * @param alias Database table alias
   * @param filter Filters
   */
  private applyFilter(
    qb:
      | SelectQueryBuilder<GenericEntity>
      | UpdateQueryBuilder<GenericEntity>
      | DeleteQueryBuilder<GenericEntity>,
    alias = "d",
    filter: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter
  ): void {
    if (!filter) {
      filter = {};
    }
    if (!advancedFilter) {
      advancedFilter = {};
    }
    const { objectJsonPathPredicts, objectFullText, rawWhere } = advancedFilter;
    const [meta, obj] = this.destructGeneralObject(filter);

    let typeId: string = null;

    if (this.target) {
      typeId = (this.target as any).typeId;
    }

    if (meta) {
      if (meta.typeId) {
        typeId = meta.typeId;
      }

      if (meta.id) {
        qb.andWhere(`${this.getAliasedProp("id", alias)} = :id`, {
          id: meta.id,
        });
      }

      if (meta.status != null) {
        qb.andWhere(`${this.getAliasedProp("status", alias)} = :status`, {
          status: meta.status,
        });
      }

      if (meta.userId) {
        qb.andWhere(`${this.getAliasedProp("userId", alias)} = :userId`, {
          userId: meta.userId,
        });
      }
    }

    if (typeId) {
      qb.andWhere(`${this.getAliasedProp("type_id", alias)} = :typeId`, {
        typeId,
      });
    }

    if (obj) {
      qb.andWhere(`${this.getAliasedProp("object", alias)} @> :obj`, {
        obj: JSON.stringify(obj),
      });
    }

    if (objectJsonPathPredicts) {
      for (const jsp of objectJsonPathPredicts) {
        qb.andWhere(`${this.getAliasedProp("object", alias)} @? '${jsp}'`);
      }
    }

    if (objectFullText) {
      let objectFullTextLang = advancedFilter.objectFullTextLang;
      if (!objectFullTextLang) {
        objectFullTextLang = "english";
      }

      qb.andWhere(
        `to_tsvector('${objectFullTextLang}', ${this.getAliasedProp(
          "object",
          alias
        )}) @@ plainto_tsquery('${objectFullTextLang}', '${objectFullText}')`
      );
    }

    if (rawWhere) {
      const actualRawWhere = rawWhere(alias);
      if (actualRawWhere) {
        qb.andWhere(actualRawWhere);
      }
    }
  }

  /**
   * Return the jsonb key selector in PostgreSQL by given array of object key.
   * @param keyPaths The array of object key
   */
  private getPglJsonbKeyPath(keyPath: string[]): string {
    return `{${keyPath.join(",")}}`;
  }
}
