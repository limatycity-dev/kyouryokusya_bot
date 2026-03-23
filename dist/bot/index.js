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
            switch (interaction.customId) {
                case "quest_complete":
                    return (0, quest_complete_button_1.handleQuestCompleteButton)(interaction);
                case "quest_close":
                    return (0, quest_close_button_1.handleQuestCloseButton)(interaction);
                case "quest_edit":
                    return (0, quest_edit_button_1.handleQuestEditButton)(interaction);
                case "ranking_refresh":
                    return (0, rankingRedreshButton_1.handleRankingRefreshButton)(interaction, client_1.client);
                case "interview_start":
                    return (0, start_1.default)(interaction);
            }
            return;
        }
        // Modals
        if (interaction.isModalSubmit()) {
            await (0, quest_create_modal_1.handleQuestCreateModal)(interaction);
            await (0, quest_edit_modal_1.handleQuestEditModal)(interaction);
            return;
        }
        // ===== MBTI 選択 =====
        if (interaction.isStringSelectMenu() && interaction.customId === "select_mbti") {
            const selected = interaction.values[0];
            const mbtiRoles = [
                "1253192472704716814", "1253192639298273461", "1253192877354258522",
                "1253192971508125726", "1253192722592825427", "1253192793187422259",
                "1253193058913353821", "1253193157538218055", "1253193251373060116",
                "1253193599277993995", "1253193331077287956", "1253193679166771331",
                "1253193449763635251", "1253193741850771467", "1253193520567816215",
                "1253193818355011584",
            ];
            if (!interaction.guild)
                return;
            // ★ GuildMember にキャスト
            const member = interaction.member;
            // 既存MBTIロールを外す
            for (const id of mbtiRoles) {
                if (member.roles.cache.has(id)) {
                    await member.roles.remove(id);
                }
            }
            // 新しいMBTIロールを付与
            await member.roles.add(selected);
            await interaction.reply({
                content: "MBTI を更新しました。",
                ephemeral: true,
            });
            return;
        }
        // ===== デバイス選択 =====
        if (interaction.isStringSelectMenu() && interaction.customId === "select_device") {
            const selected = interaction.values;
            const deviceRoles = [
                "1135611937988821173", // PC
                "1135612058335969372", // Mobile
            ];
            if (!interaction.guild)
                return;
            // ★ GuildMember にキャスト
            const member = interaction.member;
            // 既存デバイスロールを外す
            for (const id of deviceRoles) {
                if (member.roles.cache.has(id)) {
                    await member.roles.remove(id);
                }
            }
            // 選択されたデバイスロールを付与
            for (const id of selected) {
                await member.roles.add(id);
            }
            await interaction.reply({
                content: "デバイス情報を更新しました。",
                ephemeral: true,
            });
            return;
        }
    }
    catch (error) {
        console.error("INTERACTION ERROR:", error);
    }
});
