import { TextChannel, Client } from "discord.js";
import { rankingRepository } from "../repository/rankingRepository";
import { getCurrentWeekKey } from "../utils/dataUtils";
import {
  toRankingEntriesTotal,
  toRankingEntriesWeekly,
} from "../utils/rankingUtils";
import { createRealtimeRankingEmbed } from "../ui/rankingEmbed";
import { createWeeklyRankingEmbed } from "../ui/weeklyRankingEmbed";

const SYSTEM_WEEKLY_KEY = "weekly_reset_key";

export const rankingService = {
  async ensureWeeklyResetIfNeeded(): Promise<void> {
    const currentKey = getCurrentWeekKey();
    const stored = await rankingRepository.getSystemValue(SYSTEM_WEEKLY_KEY);
    if (stored === currentKey) return;

    await rankingRepository.resetWeekly();
    await rankingRepository.setSystemValue(SYSTEM_WEEKLY_KEY, currentKey);
  },

  async updateRealtimeRanking(client: Client, categoryId: string, rankingChannelId: string): Promise<void> {
    const channel = await client.channels.fetch(rankingChannelId);
    if (!channel || !channel.isTextBased()) return;

    const textChannel = channel as TextChannel;
    const rows = await rankingRepository.getRealtimeRanking(categoryId, 10);
    const entries = toRankingEntriesTotal(rows);
    const embed = createRealtimeRankingEmbed(entries);

    const messages = await textChannel.messages.fetch({ limit: 50 });
    await Promise.all(messages.map((m) => m.delete().catch(() => {})));
    await textChannel.send({ embeds: [embed] });
  },

  async updateWeeklyRanking(client: Client, categoryId: string, rankingChannelId: string): Promise<void> {
    await this.ensureWeeklyResetIfNeeded();

    const channel = await client.channels.fetch(rankingChannelId);
    if (!channel || !channel.isTextBased()) return;

    const textChannel = channel as TextChannel;
    const rows = await rankingRepository.getWeeklyRanking(categoryId, 10);
    const summary = await rankingRepository.getWeeklySummary(categoryId);
    const entries = toRankingEntriesWeekly(rows);
    const embed = createWeeklyRankingEmbed(entries, summary);

    const messages = await textChannel.messages.fetch({ limit: 50 });
    await Promise.all(messages.map((m) => m.delete().catch(() => {})));
    await textChannel.send({ embeds: [embed] });
  },
};