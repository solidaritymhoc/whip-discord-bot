"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const isTs = require('detect-ts-node');
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: 'whipbot.sqlite',
    synchronize: true,
    logging: "all",
    entities: isTs ? ["src/entity/*.ts"] : ["dist/entity/*.js"],
    migrations: [],
    subscribers: [],
    logger: "file",
});
