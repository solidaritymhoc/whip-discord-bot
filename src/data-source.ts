import { DataSource } from "typeorm"
import { config } from "dotenv"
const isTs = require('detect-ts-node');
config()

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: "all",
    entities: isTs ? ["src/entity/*.ts"] : ["/dist/entity/*.js"],
    migrations: [],
    subscribers: [],
})
