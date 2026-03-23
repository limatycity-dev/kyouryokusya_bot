import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

import { registerCommand } from "./src/features/admin/commands/register";
import { setupCommand } from "./src/features/admin/commands/setup";

import { rankingCommand } from "./src/features/ranking/commands/ranking";
import { rankingInitCommand } from "./src/features/ranking/commands/rankingInit";
import { rankingWeeklyCommand } from "./src/features/ranking/commands/rankingWeekly";

import { questCreateCommand } from "./src/features/quests/quest-create";
import { adminCommand } from "./src/features/admin/admin";

// ★ 面接コマンド
import { interviewCloseCommand } from "./src/features/interview/commands/close";

// ★ プロフィール設定コマンド ← 追加
import { profileSetupCommand } from "./src/features/profile/commands/profileSetup";

dotenv.config();

const commands = [
  registerCommand.data.toJSON(),
  setupCommand.data.toJSON(),
  questCreateCommand.data.toJSON(),
  adminCommand.data.toJSON(),

  // ★ ランキングコマンド
  rankingCommand.data.toJSON(),
  rankingInitCommand.data.toJSON(),
  rankingWeeklyCommand.data.toJSON(),

  // ★ 面接コマンド
  interviewCloseCommand.data.toJSON(),

  // ★ プロフィール設定UI ← 追加
  profileSetupCommand.data.toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

async function main() {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands }
    );
    console.log("Done.");
  } catch (err) {
    console.error(err);
  }
}

main();