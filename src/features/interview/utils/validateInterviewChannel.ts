import {
  GuildChannel,
  ThreadChannel,
  AnyThreadChannel,
} from "discord.js";
import { INTERVIEW_CATEGORY_ID } from "../config/constants";

// GuildChannel または ThreadChannel のみ parentId を持つ
export function validateInterviewChannel(
  channel: GuildChannel | ThreadChannel | AnyThreadChannel
): boolean {
  return channel.parentId === INTERVIEW_CATEGORY_ID;
}