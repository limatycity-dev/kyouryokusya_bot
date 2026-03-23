import { client } from "../bot/client";
import { GuildMember } from "discord.js";

// Admin commands
import { registerCommand } from "../features/admin/commands/register";
import { setupCommand } from "../features/admin/commands/setup";
import { adminCommand } from "../features/admin/admin";

// Ranking commands
import { rankingCommand } from "../features/ranking/commands/ranking";
import { rankingInitCommand } from "../features/ranking/commands/rankingInit";
import { rankingWeeklyCommand } from "../features/ranking/commands/rankingWeekly";

// Quest commands
import { questCreateCommand } from "../features/quests/quest-create";

// Quest buttons
import { handleQuestCompleteButton } from "../features/quests/quest-complete-button";
import { handleQuestCloseButton } from "../features/quests/quest-close-button";
import { handleQuestEditButton } from "../features/quests/quest-edit-button";

// Ranking button（新仕様）
import { handleRankingRefreshButton } from "../features/ranking/ui/rankingRedreshButton";

// Quest modals
import { handleQuestCreateModal } from "../features/quests/quest-create-modal";
import { handleQuestEditModal } from "../features/quests/quest-edit-modal";

// ===== 面接機能 =====
import startInterview from "../features/interview/buttons/start";
import { interviewCloseCommand } from "../features/interview/commands/close";

client.on("interactionCreate", async (interaction) => {
  try {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      switch (interaction.commandName) {
        case "register":
          await registerCommand.execute(interaction);
          return;

        case "setup":
          await setupCommand.execute(interaction);
          return;

        case "quest-create":
          await questCreateCommand.execute(interaction);
          return;

        case "admin":
          await adminCommand.execute(interaction);
          return;

        case "ranking":
          await rankingCommand.execute(interaction, client);
          return;

        case "ranking-init":
          await rankingInitCommand.execute(interaction, client);
          return;

        case "ranking-weekly":
          await rankingWeeklyCommand.execute(interaction, client);
          return;

        // ===== 面接終了コマンド =====
        case "interview-close":
          await interviewCloseCommand.execute(interaction);
          return;

        default:
          return;
      }
    }

    // Buttons
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "quest_complete":
          return handleQuestCompleteButton(interaction);

        case "quest_close":
          return handleQuestCloseButton(interaction);

        case "quest_edit":
          return handleQuestEditButton(interaction);

        case "ranking_refresh":
          return handleRankingRefreshButton(interaction, client);

        case "interview_start":
          return startInterview(interaction);
      }

      return;
    }

    // Modals
    if (interaction.isModalSubmit()) {
      await handleQuestCreateModal(interaction);
      await handleQuestEditModal(interaction);
      return;
    }

// ===== MBTI 選択 =====
if (interaction.isStringSelectMenu() && interaction.customId === "select_mbti") {
  const selected = interaction.values[0];

  const mbtiRoles = [
    "1253192472704716814", "1253192639298273461", "1253192877354258522",
    "1253192971508125726", "1253192722592825427", "1253192793187422259",
    "1253193058913353821", "1253193157538218055", "1253193251373060116",
    "1253193599277993995", "1253193331077287956", "1253193679166771331",
    "1253193449763635251", "1253193741850771467", "1253193520567816215",
    "1253193818355011584",
  ];

  if (!interaction.guild) return;

  // ★ GuildMember にキャスト
  const member = interaction.member as GuildMember;

  // 既存MBTIロールを外す
  for (const id of mbtiRoles) {
    if (member.roles.cache.has(id)) {
      await member.roles.remove(id);
    }
  }

  // 新しいMBTIロールを付与
  await member.roles.add(selected);

  await interaction.reply({
    content: "MBTI を更新しました。",
    ephemeral: true,
  });
  return;
}

// ===== デバイス選択 =====
if (interaction.isStringSelectMenu() && interaction.customId === "select_device") {
  const selected = interaction.values;

  const deviceRoles = [
    "1135611937988821173", // PC
    "1135612058335969372", // Mobile
  ];

  if (!interaction.guild) return;

  // ★ GuildMember にキャスト
  const member = interaction.member as GuildMember;

  // 既存デバイスロールを外す
  for (const id of deviceRoles) {
    if (member.roles.cache.has(id)) {
      await member.roles.remove(id);
    }
  }

  // 選択されたデバイスロールを付与
  for (const id of selected) {
    await member.roles.add(id);
  }

  await interaction.reply({
    content: "デバイス情報を更新しました。",
    ephemeral: true,
  });
  return;
}
    

  } catch (error) {
    console.error("INTERACTION ERROR:", error);
  }
});