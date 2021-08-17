import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import {
  ListObjectsResponseDto,
  ListObjectsQueryDto,
  UpdateObjectRequestDto,
} from "./dtos";
import { GeneralObjectStatus } from "./generated/types";
import { GeneralObject, GeneralObjectDao, PaginatedOutput } from "./types";

/**
 * DaoController should be used by inheritance with propriate @ApiTags from Nestjs in order to be generated
 * docs and API clients by openapi generator.
 */
@ApiBearerAuth()
@Controller("api/v1/general-objects")
export abstract class BaseDaoController {
  constructor(private readonly dao: GeneralObjectDao) {}

  @Get()
  @ApiOkResponse({ type: ListObjectsResponseDto })
  listObjects(
    @Query() query: ListObjectsQueryDto
  ): Promise<PaginatedOutput<GeneralObject>> {
    return this.dao.list(
      {
        limit: parseInt(query.limit as unknown as string, 10),
        nextToken: query.nextToken,
      },
      {
        meta: {
          id: query.id,
          typeId: query.typeId,
          userId: query.userId,
          status: query.status ? GeneralObjectStatus[query.status] : undefined,
        },
      }
    );
  }

  @Post(":id")
  updateObject(
    @Body() body: UpdateObjectRequestDto,
    @Param("id") id: string
  ): Promise<void> {
    return this.dao.batchUpdateWithRawJsonbSql(
      {
        meta: {
          id,
        },
      },
      null,
      `object || '${JSON.stringify(body.object || {})}'::jsonb`
    );
  }
}
