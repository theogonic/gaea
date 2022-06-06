import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION as any,
  url: process.env.TYPEORM_URL,
  logging: false,
});

export default AppDataSource;
