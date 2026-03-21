"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
// src/features/ranking/commands/rankingWeekly.ts
const discord_js_1 = require("discord.js");
const rankingService_1 = require("../services/rankingService");
const rankingEmbed_1 = require("../embeds/rankingEmbed");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("ranking-weekly")
    .setDescription("文明の週次レポートを表示します。");
async function execute(interaction) {
    const report = await (0, rankingService_1.getWeeklyReport)();
    const { embed, buttons } = (0, rankingEmbed_1.createWeeklyReportEmbed)(report);
    await interaction.reply({ embeds: [embed], components: [buttons] });
}
