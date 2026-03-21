"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const register_1 = require("../features/admin/commands/register");
const setup_1 = require("../features/admin/commands/setup");
const ranking = __importStar(require("../features/ranking/commands/ranking"));
const rankingInit = __importStar(require("../features/ranking/commands/rankingInit"));
const rankingWeekly = __importStar(require("../features/ranking/commands/rankingWeekly"));
const quest_create_1 = require("../features/quests/quest-create");
const admin_1 = require("../features/admin/admin");
const quest_complete_button_1 = require("../features/quests/quest-complete-button");
const quest_close_button_1 = require("../features/quests/quest-close-button");
const quest_edit_button_1 = require("../features/quests/quest-edit-button");
// ✅ 追加: ランキングボタンハンドラーをインポート
const ranking_button_1 = require("../features/ranking/buttons/ranking-button");
const quest_create_modal_1 = require("../features/quests/quest-create-modal");
const quest_edit_modal_1 = require("../features/quests/quest-edit-modal");
dotenv_1.default.config();
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds],
});
client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});
client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "register") {
            await register_1.registerCommand.execute(interaction);
        }
        if (interaction.commandName === "setup") {
            await setup_1.setupCommand.execute(interaction);
        }
        if (interaction.commandName === "quest-create") {
            await quest_create_1.questCreateCommand.execute(interaction);
        }
        if (interaction.commandName === "admin") {
            await admin_1.adminCommand.execute(interaction);
        }
        // ★ ランキングコマンド（data / execute 形式）
        if (interaction.commandName === "ranking") {
            await ranking.execute(interaction);
        }
        if (interaction.commandName === "ranking-init") {
            await rankingInit.execute(interaction);
        }
        if (interaction.commandName === "ranking-weekly") {
            await rankingWeekly.execute(interaction);
        }
    }
    if (interaction.isButton()) {
        await (0, quest_complete_button_1.handleQuestCompleteButton)(interaction);
        await (0, quest_close_button_1.handleQuestCloseButton)(interaction);
        await (0, quest_edit_button_1.handleQuestEditButton)(interaction);
        // ✅ 追加: ランキングボタンハンドラーを登録
        await (0, ranking_button_1.handleRankingButton)(interaction);
    }
    if (interaction.isModalSubmit()) {
        await (0, quest_create_modal_1.handleQuestCreateModal)(interaction);
        await (0, quest_edit_modal_1.handleQuestEditModal)(interaction);
    }
});
client.login(process.env.DISCORD_TOKEN);
