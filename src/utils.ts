import * as _ from "lodash";
import { SelectQueryBuilder } from "typeorm";
import { Pagination, PaginatedOutput } from "./types";

export function isFunctionAsync(f: any): boolean {
  return f.constructor.name === "AsyncFunction";
}

export class ColumnNumericTransformer {
  public to(data: number): number {
    return data;
  }
  public from(data: string): number {
    return parseFloat(data);
  }
}

export function getJSONBKeyPath(path: string[]): string {
  return `{${path.join(",")}}`;
}

export function paginateArray<T>(
  arr: T[],
  pagination: Pagination
): PaginatedOutput<T> {
  const output: PaginatedOutput<T> = {
    totalCount: arr ? arr.length : 0,
    items: [],
    nextToken: null,
  };
  if (!arr) {
    return output;
  }
  const offset = pagination.nextToken ? parseInt(pagination.nextToken, 10) : 0;
  const sliceLen =
    pagination.limit + offset > arr.length
      ? arr.length - offset
      : pagination.limit;
  if (sliceLen == 0) {
    return output;
  }
  output.items = arr.slice(offset, offset + sliceLen);
  let newNextToken = null;
  if (output.items.length + offset < output.totalCount) {
    newNextToken = `${offset + pagination.limit}`;
  }
  output.nextToken = newNextToken;
  return output;
}

export async function paginateQuery<R, T>(
  query: SelectQueryBuilder<T>,
  pagination: Pagination,
  transform?: (item: T) => R | Promise<R>
): Promise<PaginatedOutput<R>> {
  const limit = pagination.limit;
  const offset = pagination.nextToken ? parseInt(pagination.nextToken, 10) : 0;
  const result = await query.limit(limit).offset(offset).getManyAndCount();
  const [items, totalCount] = result;
  let newNextToken = null;
  // If not, means the length of items is less than limit
  if (items.length + offset < totalCount) {
    newNextToken = `${offset + limit}`;
  }
  if (transform) {
    if (isFunctionAsync(transform)) {
      const tasks = Promise.all(items.map(transform));
      const transformedItems = await tasks;
      return {
        totalCount,
        items: transformedItems,
        nextToken: newNextToken,
      };
    } else {
      return {
        totalCount,
        items: items.map(transform) as R[],
        nextToken: newNextToken,
      };
    }
  } else {
    return {
      totalCount,
      items: items as unknown as R[],
      nextToken: newNextToken,
    };
  }
}

export function mergeUpdateObject<T>(
  object: Partial<T>,
  srcObj: Partial<T>
): Partial<T> {
  // We should ignore the `undefined`.
  // We keep `null` as empty
  const filteredNulObj = _.omitBy(srcObj, _.isUndefined);

  return {
    ...object,
    ...filteredNulObj,
  };
}
