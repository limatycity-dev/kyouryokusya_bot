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
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor("#ff4d4d")
                            .setTitle("エラー")
                            .setDescription("このコマンドはサーバー内でのみ使用できます。"),
                    ],
                    ephemeral: true,
                });
            }
            const guild = interaction.guild;
            const rawName = interaction.options.getString("name", true);
            if (rawName.length > 50) {
                return interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor("#ff4d4d")
                            .setTitle("入力エラー")
                            .setDescription("カテゴリ名は50文字以内で入力してください。"),
                    ],
                    ephemeral: true,
                });
            }
            // -----------------------------
            // BOT 権限チェック
            // -----------------------------
            const botMember = guild.members.me;
            if (!botMember?.permissions.has(discord_js_1.PermissionFlagsBits.ManageChannels)) {
                return interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor("#ff4d4d")
                            .setTitle("権限エラー")
                            .setDescription("BOT に `チャンネル管理` 権限がありません。\n権限を付与してから再度お試しください。"),
                    ],
                    ephemeral: true,
                });
            }
            // -----------------------------
            // カテゴリ作成
            // -----------------------------
            const categoryName = `╭──── ⡇${rawName}`;
            const category = await guild.channels.create({
                name: categoryName,
                type: discord_js_1.ChannelType.GuildCategory,
            });
            // -----------------------------
            // settings 重複チェック（作成後の category.id を使う）
            // -----------------------------
            const exists = await client_1.db.query("SELECT 1 FROM settings WHERE category_id = $1", [category.id]);
            if ((exists?.rowCount ?? 0) > 0) {
                return interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor("#ff4d4d")
                            .setTitle("セットアップ済み")
                            .setDescription("このカテゴリはすでにセットアップされています。"),
                    ],
                    ephemeral: true,
                });
            }
            // -----------------------------
            // チャンネル作成
            // -----------------------------
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
            // -----------------------------
            // settings 保存（仕様書準拠）
            // -----------------------------
            await client_1.db.query(`INSERT INTO settings (
          category_id,
          quest_board_channel_id,
          log_channel_id,
          ranking_channel_id
        ) VALUES ($1, $2, $3, $4)`, [category.id, questBoard.id, logChannel.id, rankingChannel.id]);
            // -----------------------------
            // 管理者登録
            // -----------------------------
            await client_1.db.query("INSERT INTO admins (category_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [category.id, interaction.user.id]);
            // -----------------------------
            // ランキング初期メッセージ作成
            // -----------------------------
            const rankingMessage = await rankingChannel.send({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setTitle("🏆 ランキング（初期化）")
                        .setDescription("まだポイントがありません。クエストを進めてランキングを上げましょう！")
                        .setColor("#ffd700")
                ]
            });
            // DB に ranking_message_id を保存するならここで保存
            await client_1.db.query("UPDATE settings SET ranking_message_id = $1 WHERE category_id = $2", [rankingMessage.id, category.id]);
            // -----------------------------
            // 成功メッセージ
            // -----------------------------
            const embed = new discord_js_1.EmbedBuilder()
                .setColor("#4da6ff")
                .setTitle("セットアップ完了")
                .setDescription(`カテゴリ **${categoryName}** を作成し、必要なチャンネルをセットアップしました。`);
            return interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("SETUP ERROR:", error);
            return interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor("#ff4d4d")
                        .setTitle("内部エラー")
                        .setDescription("セットアップ中にエラーが発生しました。\n管理者に連絡してください。"),
                ],
                ephemeral: true,
            });
        }
    },
};
