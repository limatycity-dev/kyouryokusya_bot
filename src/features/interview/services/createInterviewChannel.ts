// src/features/interview/services/createInterviewChannel.ts

import {
  ChannelType,
  PermissionFlagsBits,
  Guild,
  User,
  TextChannel,
} from "discord.js";
import {
  INTERVIEW_CATEGORY_ID,
} from "../config/constants";
import interviewStartEmbed from "../embeds/interviewStart";

export async function createInterviewChannel(guild: Guild, user: User): Promise<TextChannel> {
  // Administrator 権限を持つロールを自動検出
  const adminRoles = guild.roles.cache.filter(role =>
    role.permissions.has(PermissionFlagsBits.Administrator)
  );

  // 権限設定
  const overwrites = [
    {
      id: guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
      ],
    },
    ...adminRoles.map(role => ({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
      ],
    })),
  ];

  // チャンネル名（連番は後で必要なら追加）
  const channelName = `面接-${user.username}`;

  // チャンネル作成
  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: INTERVIEW_CATEGORY_ID,
    permissionOverwrites: overwrites,
  });

  // 初期メッセージ送信
  await channel.send({
    embeds: [interviewStartEmbed(user)],
  });

  return channel;
}