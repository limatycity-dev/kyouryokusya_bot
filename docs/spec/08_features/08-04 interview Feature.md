# 08-04_interview
文明BOT：面接（Interview）機能 仕様書  
（実装完全準拠＋既知の懸念点を含む）

---

# 🎯 概要

面接機能は、文明参加希望者が応募ボタンを押すことで  
**専用の面接チャンネルが自動生成される仕組み**。

面接の流れは以下の 3 ステップで完結する：

1. **応募者がボタンを押す（start.ts）**  
2. **専用チャンネルが作成され、初期メッセージが送信される（createInterviewChannel.ts）**  
3. **管理者が `/interview-close` を実行して終了（close.ts）**

DB は使用せず、すべて Discord 上のチャンネル操作のみで完結する。

---

# 🧩 ディレクトリ構造（実装）

```
📦 interview
 ┣ 📂buttons
 ┃ ┗ 📜start.ts
 ┣ 📂commands
 ┃ ┗ 📜close.ts
 ┣ 📂config
 ┃ ┗ 📜constants.ts
 ┣ 📂embeds
 ┃ ┗ 📜interviewStart.ts
 ┣ 📂services
 ┃ ┗ 📜createInterviewChannel.ts
 ┗ 📂utils
   ┗ 📜validateInterviewChannel.ts
```

---

# 🟦 1. 面接開始（start.ts）

## ✔ トリガー
- 応募者が **ガイドラインチャンネルに設置されたボタン** を押す

## ✔ 動作
- `createInterviewChannel(guild, user)` を呼び出す
- 応募者にだけ ephemeral で通知  
  `「面接チャンネルを作成しました：<#channel>」`

## ✔ エラー処理
- ギルド外では使用不可  
- 二重返信防止  
- エラー時も応募者にだけ ephemeral 通知

---

# 🟫 2. 面接チャンネル作成（createInterviewChannel.ts）

## ✔ 管理者ロールの自動検出
```ts
guild.roles.cache.filter(role => role.permissions.has(Administrator))
```
→ **Administrator 権限を持つロールはすべて管理者として扱う**

## ✔ パーミッション仕様
| 対象 | 権限 |
|------|------|
| サーバー全体 | ViewChannel を deny |
| 応募者 | ViewChannel / SendMessages を allow |
| 管理者ロール | ViewChannel / SendMessages を allow |

→ **応募者と管理者以外は完全に見えない**

## ✔ チャンネル名
```
面接-ユーザー名
```

## ✔ 作成場所
```
INTERVIEW_CATEGORY_ID
```

## ✔ 初期メッセージ
- `interviewStartEmbed(user)` を送信
- 応募者と管理者への案内文を含む

---

# 🟨 3. 初期メッセージ（interviewStartEmbed.ts）

## ✔ embed の構造
- 色：`#E8DCC2`（文明BOTの文化色）
- タイトル：**「面接チャンネルが作成されました」**
- 説明：応募者への歓迎メッセージ
- フィールド1：応募者向け案内
- フィールド2：管理者向け案内（/interview-close を使う）
- フッター：`文明BOT - Interview System`
- タイムスタンプ付き

## ✔ 応募者向け案内
- ギルド参加理由や活動スタイルを自由に話してよい
- 気軽にメッセージを送ってよい

## ✔ 管理者向け案内
- 面接終了時は `/interview-close` を実行するだけ

---

# 🟩 4. 面接終了（close.ts）

## ✔ コマンド
```
/interview-close
```

## ✔ 実行条件
- Administrator 権限必須
- ギルド内でのみ使用可能
- validateInterviewChannel() によるカテゴリ判定を通過する必要あり

## ✔ 動作
- チャンネルを **INTERVIEW_ARCHIVE_CATEGORY_ID** へ移動
- 応募者には通知しない（管理者にだけ ephemeral 通知）

## ✔ 終了処理の特徴
- **チャンネルをロックしない**
- **メッセージは残る**
- **DB に記録しない**
- **ログは残らない**

---

# 🟧 5. 面接チャンネル判定（validateInterviewChannel.ts）

## ✔ 判定基準
```
channel.parentId === INTERVIEW_CATEGORY_ID
```

## ✔ 仕様
- 親カテゴリが面接カテゴリなら「面接チャンネル」
- 名前やパーミッションは一切見ない
- 誤操作防止のため close コマンドは必ずこの判定を通る

---

# 🟫 6. カテゴリ構造（constants.ts）

```
GUIDELINE_CHANNEL_ID
  └─ 面接開始ボタン

INTERVIEW_CATEGORY_ID
  └─ 面接-ユーザー名（面接中）

INTERVIEW_ARCHIVE_CATEGORY_ID
  └─ 過去の面接チャンネル
```

---

# ⚠️ 既知の懸念点（実装上の問題点）

## ❗ 1. 面接のログが残らない（DB 不使用）
- 面接内容は Discord のチャンネルに残るだけ  
- 合否や評価を保存する仕組みは存在しない  
- 面接履歴を後から検索・集計できない

→ **将来的に interview_logs テーブルを追加する可能性あり**

---

## ❗ 2. アーカイブ後も応募者が閲覧できる
- close.ts はパーミッションを変更しないため  
- 応募者はアーカイブ後もチャンネルを閲覧できる

→ 「アーカイブ＝応募者から見えなくする」ではない点に注意

---

## ❗ 3. 面接チャンネル名が重複する可能性
```
面接-ユーザー名
```
- 同じユーザーが複数回応募すると名前が重複する  
- 連番は現状なし

→ 必要なら createInterviewChannel.ts に連番ロジックを追加可能

---

# 🧩 面接機能のライフサイクル（まとめ）

```
[応募者] ボタンを押す
        ↓
[BOT] createInterviewChannel() でチャンネル作成
        ↓
[BOT] 初期メッセージ送信（interviewStartEmbed）
        ↓
[応募者・管理者] 面接を行う
        ↓
[管理者] /interview-close を実行
        ↓
[BOT] チャンネルをアーカイブカテゴリへ移動
```

---

# 🟦 仕様の確定ポイント（実装準拠）

- 面接は **ボタン → チャンネル作成 → close** の 3 ステップ  
- 管理者ロールは自動検出  
- 面接チャンネルはカテゴリで判定  
- 終了処理はカテゴリ移動のみ  
- DB は使用しない  
- 応募者はアーカイブ後も閲覧可能  
- 面接ログは残らない（Discord 上のみ）
