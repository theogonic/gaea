import { GeneralObjectMeta } from "./generated/types";

/**
 * This file defines the interface of DAO layer.
 */
export interface Pagination {
  limit?: number;
  nextToken?: string;
}

export interface PaginatedOutput<T> {
  totalCount: number;
  items: T[];
  nextToken: string;
}

export interface GeneralObjectAcl {
  roles?: string[];
  groups?: string[];
}

/**
 * GeneralObject defines the shape of every General object.
 */
export interface GeneralObject {
  meta: Partial<GeneralObjectMeta>;
}

/**
 * GeneralObjectFilter defines the way to filter General objects.
 */
export type GeneralObjectFilter<T extends GeneralObject> = Partial<T>;
export interface AdvancedGeneralObjectFilter {
  objectJsonPathPredicts?: string[];
  objectFullText?: string;
  objectFullTextLang?: string;
  rawWheres?: Array<(alias: string) => string>;
}

/**
 * GeneralObjectKeyPathType
 */
export enum GeneralObjectKeyPathType {
  MetadataKey,
  ObjectKey,
}

export interface GeneralObjectOrderBy {
  keyPathType: GeneralObjectKeyPathType;
  keyPath: string[];
  order: "ASC" | "DESC";
}

export type GeneralObjectConstructor<T extends new (...args) => GeneralObject> =
  new (...c: ConstructorParameters<T>) => T;

export interface GeneralObjectDao<T extends GeneralObject = GeneralObject> {
  list(
    pagination: Pagination,
    filter?: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter,
    orderBy?: GeneralObjectOrderBy
  ): Promise<PaginatedOutput<T>>;

  listOne(id: string): Promise<T>;

  listOneByFilter(
    filter: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter
  ): Promise<T>;
  listOneByUserId(userId: string): Promise<T>;

  batchUpdateWithRawJsonbSql(
    filter?: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter,
    rawObjectSql?: string
  ): Promise<void>;

  /**
   * Create or update general object
   * @param object General obejct to be created or updated.
   */
  save(object: Partial<T>): Promise<T>;

  batchDelete(
    filter?: GeneralObjectFilter<T>,
    advancedFilter?: AdvancedGeneralObjectFilter
  ): Promise<void>;

  deleteOne(id: string): Promise<void>;

  transaction<R>(
    fn: (GeneralDao: GeneralObjectDao<T>) => Promise<R>
  ): Promise<R>;

  forkDao<G extends new (...args) => GeneralObjectDao>(
    daoTarget: G
  ): InstanceType<G>;
}
