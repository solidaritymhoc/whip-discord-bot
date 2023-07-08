"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadyListener = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
class ReadyListener extends framework_1.Listener {
    constructor(context, options) {
        super(context, Object.assign(Object.assign({}, options), { once: true, event: 'ready' }));
    }
    run(client) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { username, id } = client.user;
            this.container.logger.info(`Successfully logged in as ${username} (${id})`);
            yield ((_a = client.user) === null || _a === void 0 ? void 0 : _a.setPresence({
                activities: [{
                        name: 'Cha Cha Cha',
                        type: discord_js_1.ActivityType.Listening,
                    }]
            }));
        });
    }
}
exports.ReadyListener = ReadyListener;
