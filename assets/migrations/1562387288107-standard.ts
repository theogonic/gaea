import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class standard1562387288107 implements MigrationInterface {
  public standardEntities = new Table({
    name: "generic_entities",
    columns: [
      {
        name: "id",
        type: "uuid",
        isPrimary: true,
      },
      {
        name: "created_at",
        type: "timestamptz",
        default: "now()",
        isNullable: false,
      },
      {
        name: "updated_at",
        type: "timestamptz",
        default: "now()",
        isNullable: false,
      },
      {
        name: "status",
        type: "smallint",
        isNullable: false,
      },
      {
        name: "type_id",
        type: "text",
        isNullable: false,
      },
      {
        name: "user_id",
        type: "uuid",
        isNullable: false,
      },
      {
        name: "acl",
        type: "jsonb",
        isNullable: true,
      },
      {
        name: "object",
        type: "jsonb",
        isNullable: true,
      },
    ],
    indices: [
      {
        columnNames: ["type_id"],
      },
      {
        columnNames: ["user_id"],
      },
      {
        columnNames: ["status"],
      },
    ],
  });

  private genericEntitiesObjectIdx = "generic_entities_object_idx";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(this.standardEntities, false, true, true);
    await queryRunner.query(`
            CREATE INDEX ${this.genericEntitiesObjectIdx} ON ${this.standardEntities.name} USING gin(object);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(this.standardEntities, true, true, true);
    await queryRunner.query(`
            DROP INDEX ${this.genericEntitiesObjectIdx};
        `);
  }
}