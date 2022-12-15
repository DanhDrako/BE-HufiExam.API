import { TypeOrmModuleOptions } from "@nestjs/typeorm";
require('dotenv/config');

const { 
  DB_HOST, 
  DB_POSTGRES_PORT,
  DB_USERNAME,
  DB_DATABASE,
  DB_PASSWORD,

} = process.env;

export const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: DB_HOST,
    port: Number.parseInt(DB_POSTGRES_PORT),
    username: DB_USERNAME,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    entities: ["dist/entities/*.entity{.ts,.js}"],
    synchronize: true
};