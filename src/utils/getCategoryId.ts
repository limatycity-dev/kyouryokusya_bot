import {
  Channel,
  ChannelType,
  GuildBasedChannel,
} from "discord.js";

export async function getCategoryId(
  channel: Channel | GuildBasedChannel | null
): Promise<string | null> {
  if (!channel) return null;
  if (!("guild" in channel)) return null;

  const guild = channel.guild;

  console.log("=== getCategoryId DEBUG START ===");
  console.log("channel:", channel?.id);
  console.log("channel.type:", channel?.type);
  console.log("channel.parentId:", channel?.parentId);
  console.log("channel.constructor.name:", channel?.constructor?.name);



  switch (channel.type) {
    // ============================
    // 🧵 Thread → Forum → Category
    // ============================
    case ChannelType.GuildPublicThread:
    case ChannelType.GuildPrivateThread:
    case ChannelType.GuildNewsThread: {
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

    default:
      return null;
  }
}