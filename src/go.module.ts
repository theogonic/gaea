import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DaoServiceIml } from "./dao.service.impl";
import { GenericEntity } from "./entities/GeneralEntity";
import { DAO_SERVICE } from "./generated/types";
import { UniversalGeneralObjectDao } from "./ugo.service";

@Module({
  imports: [TypeOrmModule.forFeature([GenericEntity])],
  exports: [UniversalGeneralObjectDao, TypeOrmModule, DAO_SERVICE],
  controllers: [],
  providers: [
    UniversalGeneralObjectDao,
    { provide: DAO_SERVICE, useClass: DaoServiceIml },
  ],
})
export class GeneralObjectModule {}
