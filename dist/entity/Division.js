"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Division = void 0;
const typeorm_1 = require("typeorm");
const ValidVotes_1 = require("../enums/ValidVotes");
const WhipLines_1 = require("../enums/WhipLines");
const discord_js_1 = require("discord.js");
const Formatters_1 = require("../utilities/Formatters");
let Division = class Division {
    get closed() {
        return this.closesAt < new Date();
    }
    get directive() {
        if (this.freeVote)
            return "Free Vote";
        else
            return `${this.whipLine} Line ${this.whipVote.toUpperCase()}`;
    }
    get whipEmbed() {
        return new discord_js_1.EmbedBuilder()
            .setTitle(`${this.shortName} - **${this.directive}**`)
            .setDescription(`Division ends ${(0, Formatters_1.formatDate)(this.closesAt)}`)
            .setURL(this.url)
            .setColor((0, Formatters_1.voteColour)(this.freeVote ? ValidVotes_1.ValidVotes.Free : this.whipVote))
            .setFooter({ text: this.longName });
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Division.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Division.prototype, "shortName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Division.prototype, "longName", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Division.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Division.prototype, "closesAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ValidVotes_1.ValidVotes,
        nullable: true
    }),
    __metadata("design:type", String)
], Division.prototype, "whipVote", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WhipLines_1.WhipLines,
        default: WhipLines_1.WhipLines.None,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Division.prototype, "whipLine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: false
    }),
    __metadata("design:type", Boolean)
], Division.prototype, "freeVote", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    __metadata("design:type", Date)
], Division.prototype, "reminderSentAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Division.prototype, "createdAt", void 0);
Division = __decorate([
    (0, typeorm_1.Entity)()
], Division);
exports.Division = Division;
