"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingInitCommand = void 0;
const discord_js_1 = require("discord.js");
const getCategoryId_1 = require("../../../utils/getCategoryId");
const settingRepository_1 = require("../repository/settingRepository");
exports.rankingInitCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ranking-init")
        .setDescription("ランキングチャンネルを初期化します。"),
    async execute(interaction, client) {
        try {
            const categoryId = await (0, getCategoryId_1.getCategoryId)(interaction.channel);
            if (!categoryId) {
                return interaction.reply({
                    content: "カテゴリ内で実行してください。",
                    ephemeral: true,
                });
            }
            const rankingChannelId = await (0, settingRepository_1.getRankingChannelIdByCategoryId)(categoryId);
            const channel = await client.channels.fetch(rankingChannelId);
            if (!channel || !channel.isTextBased()) {
                return interaction.reply({
                    content: "ランキングチャンネルが見つかりませんでした。",
                    ephemeral: true,
                });
            }
            const textChannel = channel;
            const messages = await textChannel.messages.fetch({ limit: 100 });
            await Promise.all(messages.map((m) => m.delete().catch(() => { })));
            return interaction.reply({
                content: "ランキングチャンネルを初期化しました。",
                ephemeral: true,
            });
        }
        catch (error) {
            console.error("RANKING INIT COMMAND ERROR:", error);
            return interaction.reply({
                content: "ランキングチャンネルの初期化中にエラーが発生しました。",
                ephemeral: true,
            });
        }
    },
};
