import {
  DaoService,
  DeleteObjectRequest,
  DeleteObjectResponse,
  ListObjectsRequest,
  ListObjectsResponse,
  UpdateObjectRequest,
  UpdateObjectResponse,
} from "./generated/types";
import { GeneralObject, GeneralObjectDao } from "./types";

export class DaoServiceIml implements DaoService {
  constructor(private readonly dao: GeneralObjectDao) {}

  async listObjects(request: ListObjectsRequest): Promise<ListObjectsResponse> {
    const objs = await this.dao.list(
      {
        limit: request.limit,
        nextToken: request.nextToken,
      },
      {
        meta: {
          id: request.id,
          typeId: request.typeId,
          userId: request.userId,
          status: request.status,
        },
      }
    );

    const items = objs.items.map((go) => JSON.stringify(go));

    return {
      items,
      totalCount: objs.totalCount,
      nextToken: objs.nextToken,
    };
  }
  async updateObject(
    request: UpdateObjectRequest
  ): Promise<UpdateObjectResponse> {
    const go = JSON.parse(request.updatedObject) as GeneralObject;
    const { meta, ...obj } = go;

    await this.dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id: request.id,
        },
      },
      null,
      `object || '${JSON.stringify(obj || {})}'::jsonb`
    );

    return {
      updatedObject: JSON.stringify(await this.dao.listOne(request.id)),
    };
  }

  async deleteObject(
    request: DeleteObjectRequest
  ): Promise<DeleteObjectResponse> {
    await this.dao.deleteOne(request.id);
    return { success: true };
  }
}
