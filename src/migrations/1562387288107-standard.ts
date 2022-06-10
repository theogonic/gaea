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

  private geObjectIdx = "ge_object_idx";
  // TODO: we can add a column to record lang and create different fts index by applying to_tsvector with lang col condition.
  private geObjectFtsIdx = "ge_object_fts_idx";
  private geCreatedAtIdx = "ge_created_at_index";
  private geUpdatedAtIdx = "ge_updated_at_index";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(this.standardEntities, false, true, true);
    await queryRunner.query(`
            CREATE INDEX ${this.geObjectIdx} ON ${this.standardEntities.name} USING gin(object);
            CREATE INDEX ${this.geObjectFtsIdx} ON ${this.standardEntities.name} USING gin(to_tsvector('english', object));
            CREATE INDEX ${this.geCreatedAtIdx} ON ${this.standardEntities.name}(created_at DESC NULLS LAST);
            CREATE INDEX ${this.geUpdatedAtIdx} ON ${this.standardEntities.name}(updated_at DESC NULLS LAST);

    `);

    // await queryRunner.query(`
    //     CREATE OR REPLACE FUNCTION notify_gaea_ge_change()
    //     RETURNS trigger AS
    //     $BODY$
    //         BEGIN
    //             PERFORM pg_notify('gaea_ge_change', json_build_object('id', NEW.id, 'type_id', NEW.type_id, 'op', TG_OP)::TEXT);
    //             RETURN NULL;
    //         END;
    //     $BODY$
    //       LANGUAGE plpgsql VOLATILE
    // `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(this.standardEntities, true, true, true);
    await queryRunner.query(`
            DROP INDEX ${this.geObjectIdx};
            DROP INDEX ${this.geCreatedAtIdx};
            DROP INDEX ${this.geUpdatedAtIdx};
            DROP INDEX ${this.geObjectFtsIdx};
        `);
  }
}
