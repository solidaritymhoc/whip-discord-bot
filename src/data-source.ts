import { DataSource } from "typeorm";
import { config } from "dotenv";
const isTs = require('detect-ts-node');
config();

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'whipbot.sqlite',
    synchronize: true,
    logging: "all",
    entities: isTs ? ["src/entity/*.ts"] : ["dist/entity/*.js"],
    migrations: [],
    subscribers: [],
    logger: "file",
});
