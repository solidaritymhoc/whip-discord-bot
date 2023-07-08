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
exports.AutocompleteHandler = void 0;
const framework_1 = require("@sapphire/framework");
const data_source_1 = require("../data-source");
const Member_1 = require("../entity/Member");
const Division_1 = require("../entity/Division");
const Proxy_1 = require("../entity/Proxy");
class AutocompleteHandler extends framework_1.InteractionHandler {
    constructor(ctx, options) {
        super(ctx, Object.assign(Object.assign({}, options), { interactionHandlerType: framework_1.InteractionHandlerTypes.Autocomplete }));
    }
    run(interaction, result) {
        return __awaiter(this, void 0, void 0, function* () {
            return interaction.respond(result);
        });
    }
    parse(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const focusedOption = interaction.options.getFocused(true);
            switch (focusedOption.name) {
                case 'member':
                case 'agent':
                    {
                        const memberRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
                        const members = yield memberRepository.find();
                        return this.some(members.map((match) => ({ name: match.redditUsername, value: match.redditUsername })));
                    }
                case 'division_id':
                case 'division_1':
                case 'division_2':
                case 'division_3':
                case 'division_4':
                    {
                        const divisionRespository = data_source_1.AppDataSource.getRepository(Division_1.Division);
                        const divisions = yield divisionRespository.find();
                        return this.some(divisions.map((match) => ({ name: match.shortName, value: match.shortName })));
                    }
                case 'proxy': {
                    const proxyRepository = data_source_1.AppDataSource.getRepository(Proxy_1.Proxy);
                    const proxies = yield proxyRepository.find({
                        relations: { member: true }
                    });
                    return this.some(proxies.map((match) => ({ name: match.member.redditUsername, value: match.id.toString() })));
                }
                default:
                    return this.none();
            }
        });
    }
}
exports.AutocompleteHandler = AutocompleteHandler;
