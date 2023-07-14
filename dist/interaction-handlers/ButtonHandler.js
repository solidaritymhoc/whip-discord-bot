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
exports.ButtonHandler = void 0;
const framework_1 = require("@sapphire/framework");
class ButtonHandler extends framework_1.InteractionHandler {
    constructor(ctx, options) {
        super(ctx, Object.assign(Object.assign({}, options), { interactionHandlerType: framework_1.InteractionHandlerTypes.Button }));
    }
    parse(interaction) {
        if (interaction.customId !== 'whip-result-pasteable')
            return this.none();
        return this.some();
    }
    run(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.reply({
                content: 'Hello from a button interaction handler!',
                // Let's make it so only the person who pressed the button can see this message!
                ephemeral: true
            });
        });
    }
}
exports.ButtonHandler = ButtonHandler;
