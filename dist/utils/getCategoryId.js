"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryId = getCategoryId;
const discord_js_1 = require("discord.js");
function getCategoryId(channel) {
    if (!channel)
        return null;
    // スレッド → 親フォーラム → カテゴリ
    if (channel.type === discord_js_1.ChannelType.PublicThread ||
        channel.type === discord_js_1.ChannelType.PrivateThread) {
        const forum = channel.parent;
        if (!forum)
            return null;
        return forum.parentId ?? null;
    }
    // フォーラム → カテゴリ
    if (channel.type === discord_js_1.ChannelType.GuildForum) {
        return channel.parentId ?? null;
    }
    // テキストチャンネル → カテゴリ
    if (channel.type === discord_js_1.ChannelType.GuildText) {
        return channel.parentId ?? null;
    }
    return null;
}
