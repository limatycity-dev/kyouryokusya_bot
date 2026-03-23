import { EmbedBuilder, User } from "discord.js";

export default function interviewStartEmbed(user: User) {
  return new EmbedBuilder()
    .setColor("#E8DCC2") // 文明BOTの文化色（ベージュ系）
    .setTitle("面接チャンネルが作成されました")
    .setDescription(
      `${user} さん、ギルド参加希望ありがとうございます！\n` +
      "以下の案内に従って、面接を進めてください。"
    )
    .addFields(
      {
        name: "応募者の方へ",
        value:
          "・ここでギルド参加の理由や活動スタイルをお聞きします。\n" +
          "・気軽にメッセージを送ってください！",
      },
      {
        name: "管理者の方へ",
        value:
          "・面接が完了したら `/interview-close` を実行してください。\n" +
          "・チャンネルは自動的にアーカイブへ移動します。",
      }
    )
    .setFooter({ text: "文明BOT - Interview System" })
    .setTimestamp();
}