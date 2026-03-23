"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../bot/client");
// Admin commands
const register_1 = require("../features/admin/commands/register");
const setup_1 = require("../features/admin/commands/setup");
const admin_1 = require("../features/admin/admin");
// Ranking commands
const ranking_1 = require("../features/ranking/commands/ranking");
const rankingInit_1 = require("../features/ranking/commands/rankingInit");
const rankingWeekly_1 = require("../features/ranking/commands/rankingWeekly");
// Quest commands
const quest_create_1 = require("../features/quests/quest-create");
// Quest buttons
const quest_complete_button_1 = require("../features/quests/quest-complete-button");
const quest_close_button_1 = require("../features/quests/quest-close-button");
const quest_edit_button_1 = require("../features/quests/quest-edit-button");
// Ranking button（新仕様）
const rankingRedreshButton_1 = require("../features/ranking/ui/rankingRedreshButton");
// Quest modals
const quest_create_modal_1 = require("../features/quests/quest-create-modal");
const quest_edit_modal_1 = require("../features/quests/quest-edit-modal");
// ===== 面接機能 =====
const start_1 = __importDefault(require("../features/interview/buttons/start"));
const close_1 = require("../features/interview/commands/close");
client_1.client.on("interactionCreate", async (interaction) => {
    try {
        // Slash Commands
        if (interaction.isChatInputCommand()) {
            switch (interaction.commandName) {
                case "register":
                    await register_1.registerCommand.execute(interaction);
                    return;
                case "setup":
                    await setup_1.setupCommand.execute(interaction);
                    return;
                case "quest-create":
                    await quest_create_1.questCreateCommand.execute(interaction);
                    return;
                case "admin":
                    await admin_1.adminCommand.execute(interaction);
                    return;
                case "ranking":
                    await ranking_1.rankingCommand.execute(interaction, client_1.client);
                    return;
                case "ranking-init":
                    await rankingInit_1.rankingInitCommand.execute(interaction, client_1.client);
                    return;
                case "ranking-weekly":
                    await rankingWeekly_1.rankingWeeklyCommand.execute(interaction, client_1.client);
                    return;
                // ===== 面接終了コマンド =====
                case "interview-close":
                    await close_1.interviewCloseCommand.execute(interaction);
                    return;
                default:
                    return;
            }
        }
        // Buttons
        if (interaction.isButton()) {
            await (0, quest_complete_button_1.handleQuestCompleteButton)(interaction);
            await (0, quest_close_button_1.handleQuestCloseButton)(interaction);
            await (0, quest_edit_button_1.handleQuestEditButton)(interaction);
            await (0, rankingRedreshButton_1.handleRankingRefreshButton)(interaction, client_1.client);
            // ===== 面接開始ボタン =====
            if (interaction.customId === "interview_start") {
                await (0, start_1.default)(interaction);
            }
            return;
        }
        // Modals
        if (interaction.isModalSubmit()) {
            await (0, quest_create_modal_1.handleQuestCreateModal)(interaction);
            await (0, quest_edit_modal_1.handleQuestEditModal)(interaction);
            return;
        }
    }
    catch (error) {
        console.error("INTERACTION ERROR:", error);
    }
});
