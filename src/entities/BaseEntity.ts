import {
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

export abstract class BaseEntity {
  @PrimaryColumn()
  public id: string;

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  public updatedAt: Date;

  @BeforeInsert()
  private beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
