"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../bot/client");
const register_1 = require("../features/admin/commands/register");
const setup_1 = require("../features/admin/commands/setup");
const admin_1 = require("../features/admin/admin");
const ranking_1 = require("../features/ranking/commands/ranking");
const rankingInit_1 = require("../features/ranking/commands/rankingInit");
const rankingWeekly_1 = require("../features/ranking/commands/rankingWeekly");
const quest_create_1 = require("../features/quests/quest-create");
const quest_complete_button_1 = require("../features/quests/quest-complete-button");
const quest_close_button_1 = require("../features/quests/quest-close-button");
const quest_edit_button_1 = require("../features/quests/quest-edit-button");
const rankingRedreshButton_1 = require("../features/ranking/ui/rankingRedreshButton");
const quest_create_modal_1 = require("../features/quests/quest-create-modal");
const quest_edit_modal_1 = require("../features/quests/quest-edit-modal");
const start_1 = __importDefault(require("../features/interview/buttons/start"));
const close_1 = require("../features/interview/commands/close");
const wipeTotal_1 = require("../features/ranking/commands/wipeTotal");
// ★ 追加
const profileSetup_1 = require("../features/profile/commands/profileSetup");
client_1.client.on("interactionCreate", async (interaction) => {
    try {
        // Slash Commands
        if (interaction.isChatInputCommand()) {
            switch (interaction.commandName) {
                case "register":
                    return register_1.registerCommand.execute(interaction);
                case "setup":
                    return setup_1.setupCommand.execute(interaction);
                case "quest-create":
                    return quest_create_1.questCreateCommand.execute(interaction);
                case "admin":
                    return admin_1.adminCommand.execute(interaction);
                case "ranking":
                    return ranking_1.rankingCommand.execute(interaction, client_1.client);
                case "ranking-init":
                    return rankingInit_1.rankingInitCommand.execute(interaction, client_1.client);
                case "ranking-weekly":
                    return rankingWeekly_1.rankingWeeklyCommand.execute(interaction, client_1.client);
                case "ranking-wipe-total":
                    return wipeTotal_1.wipeTotalCommand.execute(interaction);
                case "interview-close":
                    return close_1.interviewCloseCommand.execute(interaction);
                // ★ 追加
                case "profile-setup":
                    return profileSetup_1.profileSetupCommand.execute(interaction);
                default:
                    return;
            }
        }
        // Buttons
        if (interaction.isButton()) {
            const id = interaction.customId;
            if (id.startsWith("quest_complete")) {
                return (0, quest_complete_button_1.handleQuestCompleteButton)(interaction);
            }
            if (id.startsWith("quest_close")) {
                return (0, quest_close_button_1.handleQuestCloseButton)(interaction);
            }
            if (id.startsWith("quest_edit")) {
                return (0, quest_edit_button_1.handleQuestEditButton)(interaction);
            }
            if (id === "ranking_refresh") {
                return (0, rankingRedreshButton_1.handleRankingRefreshButton)(interaction, client_1.client);
            }
            if (id === "interview_start") {
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
            const member = interaction.member;
            for (const id of mbtiRoles) {
                if (member.roles.cache.has(id)) {
                    await member.roles.remove(id);
                }
            }
            await member.roles.add(selected);
            return interaction.reply({
                content: "MBTI を更新しました。",
                ephemeral: true,
            });
        }
        // ===== デバイス選択 =====
        if (interaction.isStringSelectMenu() && interaction.customId === "select_device") {
            const selected = interaction.values;
            const deviceRoles = [
                "1135611937988821173",
                "1135612058335969372",
            ];
            if (!interaction.guild)
                return;
            const member = interaction.member;
            for (const id of deviceRoles) {
                if (member.roles.cache.has(id)) {
                    await member.roles.remove(id);
                }
            }
            for (const id of selected) {
                await member.roles.add(id);
            }
            return interaction.reply({
                content: "デバイス情報を更新しました。",
                ephemeral: true,
            });
        }
        // ===== 得意領域選択 =====
        if (interaction.isStringSelectMenu() && interaction.customId === "select_specialty") {
            const selected = interaction.values;
            // ★ あしうのロールIDに置き換えてね
            const specialtyRoles = [
                "1486512341787869274", // デザイン
                "1486512580095774880", // 文章
                "1486512632897994803", // 企画
                "1486512684403916913", // 技術
                "1486512790155034765", // 分析
                "1486512883188760637", // 相談
            ];
            if (!interaction.guild)
                return;
            const member = interaction.member;
            // 既存の得意領域ロールを全部外す
            for (const id of specialtyRoles) {
                if (member.roles.cache.has(id)) {
                    await member.roles.remove(id);
                }
            }
            // 選択されたロールを付与
            for (const id of selected) {
                await member.roles.add(id);
            }
            return interaction.reply({
                content: "得意領域を更新しました。",
                ephemeral: true,
            });
        }
    }
    catch (error) {
        console.error("INTERACTION ERROR:", error);
    }
});
