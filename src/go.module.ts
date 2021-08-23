import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GenericEntity } from "./entities/GeneralEntity";
import { UniversalGeneralObjectDao } from "./ugo.service";

@Module({
  imports: [TypeOrmModule.forFeature([GenericEntity])],
  exports: [UniversalGeneralObjectDao, TypeOrmModule],
  controllers: [],
  providers: [UniversalGeneralObjectDao],
})
export class GeneralObjectModule {}
