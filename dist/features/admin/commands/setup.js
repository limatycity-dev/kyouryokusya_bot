"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommand = void 0;
const discord_js_1 = require("discord.js");
const client_1 = require("../../../db/client");
exports.setupCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("setup")
        .setDescription("新しい活動カテゴリを作成します")
        .addStringOption((option) => option
        .setName("name")
        .setDescription("カテゴリ名（50文字以内）")
        .setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        try {
            if (!interaction.guild) {
                return interaction.reply({
                    content: "このコマンドはサーバー内でのみ使用できます。",
                    ephemeral: true,
                });
            }
            const guild = interaction.guild;
            const rawName = interaction.options.getString("name", true);
            if (rawName.length > 50) {
                return interaction.reply({
                    content: "カテゴリ名は50文字以内で入力してください。",
                    ephemeral: true,
                });
            }
            const categoryName = `╭──── ⡇${rawName}`;
            const category = await guild.channels.create({
                name: categoryName,
                type: discord_js_1.ChannelType.GuildCategory,
            });
            const questBoard = await guild.channels.create({
                name: "クエスト掲示板",
                type: discord_js_1.ChannelType.GuildForum,
                parent: category.id,
            });
            const logChannel = await guild.channels.create({
                name: "ログ",
                type: discord_js_1.ChannelType.GuildText,
                parent: category.id,
            });
            const rankingChannel = await guild.channels.create({
                name: "ランキング",
                type: discord_js_1.ChannelType.GuildText,
                parent: category.id,
            });
            // ✅ 修正: ranking_channel_id カラムを追加
            await client_1.db.query(`INSERT INTO settings (
        category_id,
        quest_board_channel_id,
        log_channel_id,
        info_channel_id,
        ranking_channel_id
      ) VALUES ($1, $2, $3, $4, $5)`, [
                category.id,
                questBoard.id,
                logChannel.id,
                logChannel.id, // ← info_channel_id（ログ出力用）
                rankingChannel.id, // ← ranking_channel_id（ランキング表示用）
            ]);
            await client_1.db.query("INSERT INTO admins (category_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [category.id, interaction.user.id]);
            return interaction.reply(`カテゴリ **${categoryName}** を作成し、必要なチャンネルをセットアップしました！`);
        }
        catch (error) {
            console.error("SETUP ERROR:", error);
            return interaction.reply({
                content: "セットアップ中にエラーが発生しました。",
                ephemeral: true,
            });
        }
    }
};
