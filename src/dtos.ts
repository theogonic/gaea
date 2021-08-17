import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { GeneralObjectMeta, GeneralObjectStatus } from "./generated/types";
import { GeneralObject, PaginatedOutput } from "./types";

export class GeneralObjectDto implements GeneralObject {
  @ApiProperty()
  meta: Partial<GeneralObjectMeta>;
}

export class PaginationOutputDto implements PaginatedOutput<any> {
  @ApiProperty()
  totalCount: number;

  items: any[];

  @ApiProperty()
  nextToken: string;
}

export class ListObjectsQueryDto {
  @ApiPropertyOptional()
  public userId: string;

  @ApiPropertyOptional()
  public typeId: string;

  @ApiPropertyOptional({ enum: GeneralObjectStatus })
  public status: string;

  @ApiPropertyOptional()
  public id: string;

  @ApiProperty()
  limit: number;

  @ApiPropertyOptional()
  nextToken: string;
}

export class ListObjectsResponseDto extends PaginationOutputDto {
  @ApiProperty({ type: [GeneralObjectDto] })
  items: GeneralObject[];
}

export class UpdateObjectRequestDto {
  @ApiProperty()
  object: any;
}
