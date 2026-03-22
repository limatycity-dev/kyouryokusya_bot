"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryId = getCategoryId;
const discord_js_1 = require("discord.js");
async function getCategoryId(channel) {
    if (!channel)
        return null;
    if (!("guild" in channel))
        return null;
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
        case discord_js_1.ChannelType.GuildPublicThread:
        case discord_js_1.ChannelType.GuildPrivateThread:
        case discord_js_1.ChannelType.GuildNewsThread: {
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
        default:
            return null;
    }
}
