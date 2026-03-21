import { Channel, ChannelType } from "discord.js";

export function getCategoryId(channel: Channel | null): string | null {
  if (!channel) return null;

  switch (channel.type) {
    // スレッド → 親フォーラム → カテゴリ
    case ChannelType.PublicThread:
    case ChannelType.PrivateThread: {
      const forum = channel.parent;
      if (!forum) return null;
      return forum.parentId ?? null;
    }

    // フォーラム → カテゴリ
    case ChannelType.GuildForum:
      return channel.parentId ?? null;

    // テキストチャンネル → カテゴリ
    case ChannelType.GuildText:
      return channel.parentId ?? null;

    // ボイスチャンネル → カテゴリ
    case ChannelType.GuildVoice:
      return channel.parentId ?? null;

    // ステージチャンネル → カテゴリ
    case ChannelType.GuildStageVoice:
      return channel.parentId ?? null;

    // アナウンスチャンネル → カテゴリ
    case ChannelType.GuildAnnouncement:
      return channel.parentId ?? null;

    // メディアチャンネル → カテゴリ
    case ChannelType.GuildMedia:
      return channel.parentId ?? null;

    // DM / GroupDM / CategoryChannel など → 文明カテゴリ外
    default:
      return null;
  }
}