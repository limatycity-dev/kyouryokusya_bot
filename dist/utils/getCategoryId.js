"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryId = getCategoryId;
const discord_js_1 = require("discord.js");
function getCategoryId(channel) {
    if (!channel)
        return null;
    switch (channel.type) {
        // スレッド → 親フォーラム → カテゴリ
        case discord_js_1.ChannelType.PublicThread:
        case discord_js_1.ChannelType.PrivateThread: {
            const forum = channel.parent;
            if (!forum)
                return null;
            return forum.parentId ?? null;
        }
        // フォーラム → カテゴリ
        case discord_js_1.ChannelType.GuildForum:
            return channel.parentId ?? null;
        // テキストチャンネル → カテゴリ
        case discord_js_1.ChannelType.GuildText:
            return channel.parentId ?? null;
        // ボイスチャンネル → カテゴリ
        case discord_js_1.ChannelType.GuildVoice:
            return channel.parentId ?? null;
        // ステージチャンネル → カテゴリ
        case discord_js_1.ChannelType.GuildStageVoice:
            return channel.parentId ?? null;
        // アナウンスチャンネル → カテゴリ
        case discord_js_1.ChannelType.GuildAnnouncement:
            return channel.parentId ?? null;
        // メディアチャンネル → カテゴリ
        case discord_js_1.ChannelType.GuildMedia:
            return channel.parentId ?? null;
        // DM / GroupDM / CategoryChannel など → 文明カテゴリ外
        default:
            return null;
    }
}
