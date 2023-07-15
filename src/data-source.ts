import { DataSource } from "typeorm"
import { config } from "dotenv"
config()

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'whipbot.sqlite',
    synchronize: true,
    logging: false,
    entities: ["src/entity/*.ts"],
    migrations: [],
    subscribers: [],
})
