import { client } from "../bot/client";

import { registerCommand } from "../features/admin/commands/register";
import { setupCommand } from "../features/admin/commands/setup";

import * as ranking from "../features/ranking/commands/ranking";
import * as rankingInit from "../features/ranking/commands/rankingInit";
import * as rankingWeekly from "../features/ranking/commands/rankingWeekly";

import { questCreateCommand } from "../features/quests/quest-create";
import { adminCommand } from "../features/admin/admin";

import { handleQuestCompleteButton } from "../features/quests/quest-complete-button";
import { handleQuestCloseButton } from "../features/quests/quest-close-button";
import { handleQuestEditButton } from "../features/quests/quest-edit-button";

import { handleRankingButton } from "../features/ranking/buttons/ranking-button";

import { handleQuestCreateModal } from "../features/quests/quest-create-modal";
import { handleQuestEditModal } from "../features/quests/quest-edit-modal";

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
          await ranking.execute(interaction);
          return;

        case "ranking-init":
          await rankingInit.execute(interaction);
          return;

        case "ranking-weekly":
          await rankingWeekly.execute(interaction);
          return;

        default:
          return;
      }
    }

    // Buttons
    if (interaction.isButton()) {
      await handleQuestCompleteButton(interaction);
      await handleQuestCloseButton(interaction);
      await handleQuestEditButton(interaction);
      await handleRankingButton(interaction);
      return;
    }

    // Modals
    if (interaction.isModalSubmit()) {
      await handleQuestCreateModal(interaction);
      await handleQuestEditModal(interaction);
      return;
    }
  } catch (error) {
    console.error("INTERACTION ERROR:", error);
  }
});