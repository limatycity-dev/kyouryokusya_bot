"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewCloseCommand = void 0;
const discord_js_1 = require("discord.js");
const constants_1 = require("../config/constants");
const validateInterviewChannel_1 = require("../utils/validateInterviewChannel");
exports.interviewCloseCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("interview-close")
        .setDescription("面接チャンネルをアーカイブへ移動します。")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            const channel = interaction.channel;
            if (!channel || !interaction.guild) {
                return interaction.reply({
                    content: "サーバー内でのみ使用できます。",
                    ephemeral: true,
                });
            }
            // 管理者権限チェック
            if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: "このコマンドを実行する権限がありません。",
                    ephemeral: true,
                });
            }
            // GuildChannel にキャスト
            const guildChannel = channel;
            // 面接カテゴリ判定
            if (!(0, validateInterviewChannel_1.validateInterviewChannel)(guildChannel)) {
                return interaction.reply({
                    content: "このチャンネルは面接チャンネルではありません。",
                    ephemeral: true,
                });
            }
            // アーカイブカテゴリへ移動
            await guildChannel.setParent(constants_1.INTERVIEW_ARCHIVE_CATEGORY_ID);
            return interaction.reply({
                content: "面接を終了し、チャンネルをアーカイブへ移動しました。",
                ephemeral: true,
            });
        }
        catch (error) {
            console.error("INTERVIEW CLOSE ERROR:", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "面接終了処理中にエラーが発生しました。",
                    ephemeral: true,
                });
            }
        }
    },
};
