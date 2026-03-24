import { client } from "../bot/client";
import { GuildMember } from "discord.js";

import { registerCommand } from "../features/admin/commands/register";
import { setupCommand } from "../features/admin/commands/setup";
import { adminCommand } from "../features/admin/admin";

import { rankingCommand } from "../features/ranking/commands/ranking";
import { rankingInitCommand } from "../features/ranking/commands/rankingInit";
import { rankingWeeklyCommand } from "../features/ranking/commands/rankingWeekly";

import { questCreateCommand } from "../features/quests/quest-create";

import { handleQuestCompleteButton } from "../features/quests/quest-complete-button";
import { handleQuestCloseButton } from "../features/quests/quest-close-button";
import { handleQuestEditButton } from "../features/quests/quest-edit-button";

import { handleRankingRefreshButton } from "../features/ranking/ui/rankingRedreshButton";

import { handleQuestCreateModal } from "../features/quests/quest-create-modal";
import { handleQuestEditModal } from "../features/quests/quest-edit-modal";

import startInterview from "../features/interview/buttons/start";
import { interviewCloseCommand } from "../features/interview/commands/close";

// ★ 追加
import { profileSetupCommand } from "../features/profile/commands/profileSetup";

client.on("interactionCreate", async (interaction) => {
  try {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      switch (interaction.commandName) {
        case "register":
          return registerCommand.execute(interaction);

        case "setup":
          return setupCommand.execute(interaction);

        case "quest-create":
          return questCreateCommand.execute(interaction);

        case "admin":
          return adminCommand.execute(interaction);

        case "ranking":
          return rankingCommand.execute(interaction, client);

        case "ranking-init":
          return rankingInitCommand.execute(interaction, client);

        case "ranking-weekly":
          return rankingWeeklyCommand.execute(interaction, client);

        case "interview-close":
          return interviewCloseCommand.execute(interaction);

        // ★ 追加
        case "profile-setup":
          return profileSetupCommand.execute(interaction);

        default:
          return;
      }
    }

    // Buttons
    if (interaction.isButton()) {
      const id = interaction.customId;

      if (id.startsWith("quest_complete")) {
        return handleQuestCompleteButton(interaction);
      }

      if (id.startsWith("quest_close")) {
        return handleQuestCloseButton(interaction);
      }

      if (id.startsWith("quest_edit")) {
        return handleQuestEditButton(interaction);
      }

      if (id === "ranking_refresh") {
        return handleRankingRefreshButton(interaction, client);
      }

      if (id === "interview_start") {
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

      const member = interaction.member as GuildMember;

      for (const id of mbtiRoles) {
        if (member.roles.cache.has(id)) {
          await member.roles.remove(id);
        }
      }

      await member.roles.add(selected);

      return interaction.reply({
        content: "MBTI を更新しました。",
        ephemeral: true,
      });
    }

    // ===== デバイス選択 =====
    if (interaction.isStringSelectMenu() && interaction.customId === "select_device") {
      const selected = interaction.values;

      const deviceRoles = [
        "1135611937988821173",
        "1135612058335969372",
      ];

      if (!interaction.guild) return;

      const member = interaction.member as GuildMember;

      for (const id of deviceRoles) {
        if (member.roles.cache.has(id)) {
          await member.roles.remove(id);
        }
      }

      for (const id of selected) {
        await member.roles.add(id);
      }

      return interaction.reply({
        content: "デバイス情報を更新しました。",
        ephemeral: true,
      });
    }

  } catch (error) {
    console.error("INTERACTION ERROR:", error);
  }
});