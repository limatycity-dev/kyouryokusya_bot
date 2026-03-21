import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

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

// ✅ 追加: ランキングボタンハンドラーをインポート
import { handleRankingButton } from "../features/ranking/buttons/ranking-button";

import { handleQuestCreateModal } from "../features/quests/quest-create-modal";
import { handleQuestEditModal } from "../features/quests/quest-edit-modal";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "register") {
      await registerCommand.execute(interaction);
    }

    if (interaction.commandName === "setup") {
      await setupCommand.execute(interaction);
    }

    if (interaction.commandName === "quest-create") {
      await questCreateCommand.execute(interaction);
    }

    if (interaction.commandName === "admin") {
      await adminCommand.execute(interaction);
    }

    // ★ ランキングコマンド（data / execute 形式）
    if (interaction.commandName === "ranking") {
      await ranking.execute(interaction);
    }

    if (interaction.commandName === "ranking-init") {
      await rankingInit.execute(interaction);
    }

    if (interaction.commandName === "ranking-weekly") {
      await rankingWeekly.execute(interaction);
    }
  }

  if (interaction.isButton()) {
    await handleQuestCompleteButton(interaction);
    await handleQuestCloseButton(interaction);
    await handleQuestEditButton(interaction);
    
    // ✅ 追加: ランキングボタンハンドラーを登録
    await handleRankingButton(interaction);
  }

  if (interaction.isModalSubmit()) {
    await handleQuestCreateModal(interaction);
    await handleQuestEditModal(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);