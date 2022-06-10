import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION as any,
  url: process.env.TYPEORM_URL,
  migrations: ((process.env.TYPEORM_MIGRATIONS as any) || "").split(","),
  logging: false,
});

export default AppDataSource;
