import { client } from "../bot/client";

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
} catch (error) {
  console.error("INTERACTION ERROR:", error);
}
});