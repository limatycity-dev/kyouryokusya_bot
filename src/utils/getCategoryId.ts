import { Channel, ChannelType } from "discord.js";

export function getCategoryId(channel: Channel | null) {
  if (!channel) return null;

  // スレッド → 親フォーラム → カテゴリ
  if (
    channel.type === ChannelType.PublicThread ||
    channel.type === ChannelType.PrivateThread
  ) {
    const forum = channel.parent;
    if (!forum) return null;
    return forum.parentId ?? null;
  }

  // フォーラム → カテゴリ
  if (channel.type === ChannelType.GuildForum) {
    return channel.parentId ?? null;
  }

  // テキストチャンネル → カテゴリ
  if (channel.type === ChannelType.GuildText) {
    return channel.parentId ?? null;
  }

  return null;
}