import { ApiTags, ApiPropertyOptional, ApiProperty, ApiOkResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { Inject, Controller, Get, Post, Delete, Put, Param, Query, Body, ParseIntPipe, ParseBoolPipe } from "@nestjs/common";
import { GeneralObjectStatus, GeneralObjectMeta, DaoService, DAO_SERVICE, ListObjectsRequest, UpdateObjectRequest, DeleteObjectRequest } from "./types";
export class GeneralObjectMetaDto {
    @ApiPropertyOptional()
    id?: string;
    @ApiPropertyOptional()
    userId?: string;
    @ApiPropertyOptional()
    typeId?: string;
    @ApiPropertyOptional({ enum: GeneralObjectStatus })
    status?: string;
    @ApiPropertyOptional()
    updatedAt?: number;
    @ApiPropertyOptional()
    createdAt?: number;
    static fromRaw(raw: GeneralObjectMeta): GeneralObjectMetaDto {
        if (!raw) {
            return raw as any;
        }
        return {
            id: raw.id,
            userId: raw.userId,
            typeId: raw.typeId,
            status: GeneralObjectStatus[raw.status],
            updatedAt: raw.updatedAt,
            createdAt: raw.createdAt
        };
    }
}
export class ListObjectsResponseDto {
    @ApiPropertyOptional()
    totalCount?: number;
    @ApiPropertyOptional()
    nextToken?: string;
    @ApiPropertyOptional({ type: [String] })
    items?: string[];
}
export class UpdateObjectResponseDto {
    @ApiPropertyOptional()
    updatedObject?: string;
}
export class UpdateObjectRequestBodyDto {
    @ApiPropertyOptional()
    updatedObject?: string;
}
export class DeleteObjectResponseDto {
    @ApiPropertyOptional()
    success?: boolean;
}
export class DeleteObjectRequestBodyDto {
}
@Controller("DaoService")
export class DaoServiceController {
    constructor(
    @Inject(DAO_SERVICE)
    private readonly daoService: DaoService) { }
    @Get("gaea/objects")
    @ApiOkResponse({ type: ListObjectsResponseDto })
    @ApiQuery({ name: "id", required: false })
    @ApiQuery({ name: "userId", required: false })
    @ApiQuery({ name: "typeId", required: false })
    @ApiQuery({ name: "status", required: false, enum: GeneralObjectStatus })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "nextToken", required: false })
    async listObjects(
    @Query("id")
    id: string, 
    @Query("userId")
    userId: string, 
    @Query("typeId")
    typeId: string, 
    @Query("status")
    status: string, 
    @Query("limit", ParseIntPipe)
    limit: number, 
    @Query("nextToken")
    nextToken: string): Promise<ListObjectsResponseDto> {
        const _req = {
            id,
            userId,
            typeId,
            status: GeneralObjectStatus[status],
            limit,
            nextToken
        } as ListObjectsRequest;
        const _res = await this.daoService.listObjects(_req);
        return _res;
    }
    @Put("gaea/object/:id")
    @ApiOkResponse({ type: UpdateObjectResponseDto })
    async updateObject(
    @Param("id")
    id: string, 
    @Body()
    body: UpdateObjectRequestBodyDto): Promise<UpdateObjectResponseDto> {
        const _req = {
            id,
            updatedObject: body.updatedObject
        } as UpdateObjectRequest;
        const _res = await this.daoService.updateObject(_req);
        return _res;
    }
    @Delete("gaea/object/:id")
    @ApiOkResponse({ type: DeleteObjectResponseDto })
    async deleteObject(
    @Param("id")
    id: string, 
    @Body()
    body: DeleteObjectRequestBodyDto): Promise<DeleteObjectResponseDto> {
        const _req = {
            id
        } as DeleteObjectRequest;
        const _res = await this.daoService.deleteObject(_req);
        return _res;
    }
}
