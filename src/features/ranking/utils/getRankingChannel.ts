import { TextChannel } from "discord.js";
import { client } from "../../../db/client";
import { getGuildSettings } from "../../../db/settingsStore";

export async function getRankingChannel(guildId: string | null): Promise<TextChannel | null> {
  if (!guildId) return null;

  const settings = await getGuildSettings(guildId);
  if (!settings?.rankingChannelId) return null;

  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(settings.rankingChannelId);

  return channel instanceof TextChannel ? channel : null;
}