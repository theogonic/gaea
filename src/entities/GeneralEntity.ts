import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("generic_entities")
export class GenericEntity extends BaseEntity {
  @Column("uuid", { name: "user_id" })
  public userId: string;

  @Column("text", { name: "type_id" })
  public typeId: string;

  @Column("smallint")
  public status: number;

  @Column("jsonb")
  public object: never;
}
