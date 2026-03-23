import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  TextChannel,
} from "discord.js";

export const profileSetupCommand = {
  data: new SlashCommandBuilder()
    .setName("profile-setup")
    .setDescription("プロフィール設定UIを指定チャンネルに送信します"),

  async execute(interaction: ChatInputCommandInteraction) {
    const channelId = "1485613648784396329";
    const channel = await interaction.client.channels.fetch(channelId);

    // ★ ここで TextChannel に型を絞る
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "チャンネルが見つからないか、テキストチャンネルではありません。",
        ephemeral: true,
      });
    }

    const textChannel = channel as TextChannel;

    // ===== メッセージ本文 =====
    const messageText = `
**あなたの “基本プロフィール” を設定しましょう。**

ここで選んだ情報は、サーバー内の棚に反映され、
メンバー同士のコミュニケーションや遊び方の参考になります。

- **MBTI**：あなたの思考スタイルを示す指標です（1つだけ選択）
- **デバイス**：普段使っているプレイ環境です（複数選択可）

必要に応じていつでも変更できます。
あなたらしいスタイルで、気軽に参加してみてください。
`;

    // ===== MBTI セレクトメニュー =====
    const mbtiMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select_mbti")
        .setPlaceholder("MBTI を選択（1つ）")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions([
          { label: "INTJ", value: "1253192472704716814" },
          { label: "INTP", value: "1253192639298273461" },
          { label: "INFJ", value: "1253192877354258522" },
          { label: "INFP", value: "1253192971508125726" },
          { label: "ENTJ", value: "1253192722592825427" },
          { label: "ENTP", value: "1253192793187422259" },
          { label: "ENFJ", value: "1253193058913353821" },
          { label: "ENFP", value: "1253193157538218055" },
          { label: "ISTJ", value: "1253193251373060116" },
          { label: "ISTP", value: "1253193599277993995" },
          { label: "ISFJ", value: "1253193331077287956" },
          { label: "ISFP", value: "1253193679166771331" },
          { label: "ESTJ", value: "1253193449763635251" },
          { label: "ESTP", value: "1253193741850771467" },
          { label: "ESFJ", value: "1253193520567816215" },
          { label: "ESFP", value: "1253193818355011584" },
        ])
    );

    // ===== デバイス セレクトメニュー =====
    const deviceMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select_device")
        .setPlaceholder("デバイスを選択（複数可）")
        .setMinValues(0)
        .setMaxValues(2)
        .addOptions([
          { label: "🖥️ PC", value: "1135611937988821173" },
          { label: "📱 Mobile", value: "1135612058335969372" },
        ])
    );

    // ★ send() が安全に使える
    await textChannel.send({
      content: messageText,
      components: [mbtiMenu, deviceMenu],
    });

    await interaction.reply({
      content: "プロフィール設定UIを送信しました。",
      ephemeral: true,
    });
  },
};