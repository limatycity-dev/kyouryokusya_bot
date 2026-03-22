import {
  Channel,
  ChannelType,
  GuildBasedChannel,
} from "discord.js";

/**
 * 文明カテゴリIDを取得する（完全安定版）
 */
export async function getCategoryId(
  channel: Channel | GuildBasedChannel | null
): Promise<string | null> {
  if (!channel) return null;

  // Guild 内でしか使わないので GuildBasedChannel に絞る
  if (!("guild" in channel)) return null;

  const guild = channel.guild;

  switch (channel.type) {
    // ============================
    // 🧵 Thread → Forum → Category
    // ============================
    case ChannelType.PublicThread:
    case ChannelType.PrivateThread: {
      const forumId = channel.parentId;
      if (!forumId) return null;

      const forum = await guild.channels.fetch(forumId).catch(() => null);
      if (!forum || forum.type !== ChannelType.GuildForum) return null;

      return forum.parentId ?? null;
    }

    // ============================
    // 🗂 Forum → Category
    // ============================
    case ChannelType.GuildForum:
      return channel.parentId ?? null;

    // ============================
    // 💬 Text / 🔊 Voice / 📣 Announcement → Category
    // ============================
    case ChannelType.GuildText:
    case ChannelType.GuildVoice:
    case ChannelType.GuildStageVoice:
    case ChannelType.GuildAnnouncement:
    case ChannelType.GuildMedia:
      return channel.parentId ?? null;

    // ============================
    // ❌ DM / CategoryChannel / その他
    // ============================
    default:
      return null;
  }
}