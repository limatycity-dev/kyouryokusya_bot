"use strict";
// src/features/interview/services/createInterviewChannel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterviewChannel = createInterviewChannel;
const discord_js_1 = require("discord.js");
const constants_1 = require("../config/constants");
const interviewStart_1 = __importDefault(require("../embeds/interviewStart"));
async function createInterviewChannel(guild, user) {
    // Administrator 権限を持つロールを自動検出
    const adminRoles = guild.roles.cache.filter(role => role.permissions.has(discord_js_1.PermissionFlagsBits.Administrator));
    // 権限設定
    const overwrites = [
        {
            id: guild.id,
            deny: [discord_js_1.PermissionFlagsBits.ViewChannel],
        },
        {
            id: user.id,
            allow: [
                discord_js_1.PermissionFlagsBits.ViewChannel,
                discord_js_1.PermissionFlagsBits.SendMessages,
            ],
        },
        ...adminRoles.map(role => ({
            id: role.id,
            allow: [
                discord_js_1.PermissionFlagsBits.ViewChannel,
                discord_js_1.PermissionFlagsBits.SendMessages,
            ],
        })),
    ];
    // チャンネル名（連番は後で必要なら追加）
    const channelName = `面接-${user.username}`;
    // チャンネル作成
    const channel = await guild.channels.create({
        name: channelName,
        type: discord_js_1.ChannelType.GuildText,
        parent: constants_1.INTERVIEW_CATEGORY_ID,
        permissionOverwrites: overwrites,
    });
    // 初期メッセージ送信
    await channel.send({
        embeds: [(0, interviewStart_1.default)(user)],
    });
    return channel;
}
