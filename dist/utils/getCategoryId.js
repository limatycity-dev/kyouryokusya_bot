"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryId = getCategoryId;
const discord_js_1 = require("discord.js");
/**
 * 文明カテゴリIDを取得する（完全安定版）
 */
async function getCategoryId(channel) {
    if (!channel)
        return null;
    // Guild 内でしか使わないので GuildBasedChannel に絞る
    if (!("guild" in channel))
        return null;
    const guild = channel.guild;
    switch (channel.type) {
        // ============================
        // 🧵 Thread → Forum → Category
        // ============================
        case discord_js_1.ChannelType.PublicThread:
        case discord_js_1.ChannelType.PrivateThread: {
            const forumId = channel.parentId;
            if (!forumId)
                return null;
            const forum = await guild.channels.fetch(forumId).catch(() => null);
            if (!forum || forum.type !== discord_js_1.ChannelType.GuildForum)
                return null;
            return forum.parentId ?? null;
        }
        // ============================
        // 🗂 Forum → Category
        // ============================
        case discord_js_1.ChannelType.GuildForum:
            return channel.parentId ?? null;
        // ============================
        // 💬 Text / 🔊 Voice / 📣 Announcement → Category
        // ============================
        case discord_js_1.ChannelType.GuildText:
        case discord_js_1.ChannelType.GuildVoice:
        case discord_js_1.ChannelType.GuildStageVoice:
        case discord_js_1.ChannelType.GuildAnnouncement:
        case discord_js_1.ChannelType.GuildMedia:
            return channel.parentId ?? null;
        // ============================
        // ❌ DM / CategoryChannel / その他
        // ============================
        default:
            return null;
    }
}
