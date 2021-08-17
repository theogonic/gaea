import {
  ApiTags,
  ApiPropertyOptional,
  ApiProperty,
  ApiOkResponse,
} from "@nestjs/swagger";
import {
  Inject,
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
import { GeneralObjectStatus } from "./types";
export class GeneralObjectMetaDto {
  @ApiPropertyOptional()
  id: string;
  @ApiPropertyOptional()
  userId: string;
  @ApiPropertyOptional()
  typeId: string;
  @ApiPropertyOptional({ enum: GeneralObjectStatus })
  status: GeneralObjectStatus;
  @ApiPropertyOptional()
  updatedAt: number;
  @ApiPropertyOptional()
  createdAt: number;
}
