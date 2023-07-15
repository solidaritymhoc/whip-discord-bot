"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: 'whipbot.sqlite',
    synchronize: true,
    logging: false,
    entities: ["src/entity/*.ts"],
    migrations: [],
    subscribers: [],
});
