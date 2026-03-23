"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = startInterview;
const createInterviewChannel_1 = require("../services/createInterviewChannel");
async function startInterview(interaction) {
    try {
        // 応募者（ボタンを押したユーザー）
        const user = interaction.user;
        const guild = interaction.guild;
        if (!guild) {
            return interaction.reply({
                content: "サーバー内でのみ使用できます。",
                ephemeral: true,
            });
        }
        // 面接チャンネル作成
        const channel = await (0, createInterviewChannel_1.createInterviewChannel)(guild, user);
        // 応募者に通知
        await interaction.reply({
            content: `面接チャンネルを作成しました：${channel}`,
            ephemeral: true,
        });
    }
    catch (error) {
        console.error("INTERVIEW START ERROR:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "面接チャンネルの作成中にエラーが発生しました。",
                ephemeral: true,
            });
        }
    }
}
