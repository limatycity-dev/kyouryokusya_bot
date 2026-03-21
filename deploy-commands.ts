import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

import { registerCommand } from "./src/features/admin/commands/register";
import { setupCommand } from "./src/features/admin/commands/setup";

import * as ranking from "./src/features/ranking/commands/ranking";
import * as rankingInit from "./src/features/ranking/commands/rankingInit";
import * as rankingWeekly from "./src/features/ranking/commands/rankingWeekly";

import { questCreateCommand } from "./src/features/quests/quest-create";
import { adminCommand } from "./src/features/admin/admin";

dotenv.config();

const commands = [
  registerCommand.data.toJSON(),
  setupCommand.data.toJSON(),
  questCreateCommand.data.toJSON(),
  adminCommand.data.toJSON(),

  // ★ ランキングコマンド（data / execute 形式）
  ranking.data.toJSON(),
  rankingInit.data.toJSON(),
  rankingWeekly.data.toJSON(),
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