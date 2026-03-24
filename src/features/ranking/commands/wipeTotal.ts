import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} from "discord.js";

import { wipeService } from "../services/wipeService";
import { getRankingChannelIdByCategory } from "../../../db/settingsStore";
import { getCategoryId } from "../../../utils/getCategoryId";
import { isAdmin } from "../../../utils/isAdmin";

export const wipeTotalCommand = {
    data: new SlashCommandBuilder()
        .setName("ranking-wipe-total")
        .setDescription("累計ランキングをリセットします（管理者のみ）"),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // 文明カテゴリ判定
            const categoryId = await getCategoryId(interaction.channel);
            if (!categoryId) {
                return interaction.reply({
                    content: "文明カテゴリ内で実行してください。",
                    ephemeral: true,
                });
            }

            // 管理者チェック
            const ok = await isAdmin(interaction.user.id, categoryId);
            if (!ok) {
                return interaction.reply({
                    content: "あなたはこの文明の管理者ではありません。",
                    ephemeral: true,
                });
            }

            // ランキングチャンネル取得
            const settings = await getRankingChannelIdByCategory(categoryId);
            const rankingChannelId = settings?.rankingChannelId;



            if (!rankingChannelId) {
                return interaction.reply({
                    content: "ランキングチャンネルが設定されていません。",
                    ephemeral: true,
                });
            }

            // ワイプ実行
            await wipeService.wipeTotalRanking(
                interaction.client,
                categoryId,
                rankingChannelId
            );

            // 成功メッセージ
            return interaction.reply({
                content:
                    "🌙 文明の累計ランキングをリセットしました。\nすべての参加者が同じスタートラインに立ちました。",
            });
        } catch (error) {
            console.error("[ranking-wipe-total] Error:", error);
            return interaction.reply({
                content: "エラーが発生しました。もう一度お試しください。",
                ephemeral: true,
            });
        }
    },
};