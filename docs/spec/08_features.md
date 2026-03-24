

========================================
# 08-00 overview.txt
========================================

# 03_features Overview  
主要機能（Features）仕様書

## 1. 概要（What are Features?）
本プロジェクトは **feature-based architecture** を採用しており、  
すべての機能は `/src/features/*` として独立した「棚（feature）」として管理される。

この章（03_features）は、  
**各 feature の目的・データ・UI・コマンド・状態・運用を体系的にまとめた “文明の中心”** である。

## 2. 役割（Role of Features）
features は以下の役割を持つ：

- **機能単位で文明を分割し、保守性を最大化する**
- **コードと仕様書を 1:1 対応させる**
- **変更の影響範囲を明確化する**
- **UI / コマンド / DB / 状態遷移を feature ごとに整理する**

これにより、  
「どの棚（feature）が何を担当しているか」が一瞬で分かる文明が成立する。

## 3. features 一覧（Mapping to /src/features）
本プロジェクトの主要機能は以下の 5 つで構成される。

| Feature | 説明 | 対応ディレクトリ |
|--------|------|------------------|
| 03-01_admin | 管理者向け機能（設定・強制操作） | /src/features/admin |
| 03-02_interview | 初期面談（ユーザー onboarding） | /src/features/interview |
| 03-03_profile | プロフィール管理 | /src/features/profile |
| 03-04_quests | クエスト（タスク）管理 | /src/features/quests |
| 03-05_ranking | ランキング・スコア集計 | /src/features/ranking |

これらは **文明の主要機能（core gameplay loop）** を構成する。

## 4. features の構造（Feature Structure）
各 feature は以下の構造で記述される。

- **目的（Purpose）**
- **データ仕様（Data Schema）**
- **ステート（State Machine）**
- **コマンド（Commands）**
- **UI（Buttons / Modals / Embeds）**
- **運用フロー（Operation Flow）**
- **エラー仕様（Error Handling）**
- **将来拡張（Future Work）**

この統一フォーマットにより、  
どの feature も同じ “文明の型” で理解できる。

## 5. features と他章の関係（Cross-References）
features は以下の章と密接に連携する。

- **02_db_schema**  
  → 各 feature が使用するテーブルを参照  
- **04_state_machine**  
  → 全体の状態遷移と feature 間の流れ  
- **05_commands**  
  → feature ごとのコマンド仕様  
- **06_ui_spec**  
  → ボタン・モーダル・embed の UI 定義  
- **07_operation_flow**  
  → 管理者・日常運用のフロー  
- **08_error_handling**  
  → 共通エラーと feature ごとのエラー

03_features はこれらの “横断仕様” の中心に位置する。

## 6. 全体構造図（Feature Architecture）
```
User
 └─ Commands
      └─ Feature Logic (/src/features/*)
            ├─ Data Access (DB)
            ├─ UI (Buttons / Modals / Embeds)
            ├─ State Machine
            └─ Operation Flow
```

## 7. 今後の拡張性（Future Scalability）
feature-based architecture により、  
以下のような新機能を容易に追加できる。

- /src/features/guild  
- /src/features/season  
- /src/features/market  
- /src/features/achievement  

新しい棚を追加するだけで文明が拡張される。


========================================
# 08-01 Admin Feature.txt
========================================

# 08-01 Admin Feature  
文明の基盤機能（カテゴリ作成・管理者管理・旧ユーザー登録）

---

# 1. 概要（Overview）
Admin feature は文明の運営に必要な **基盤機能** を提供する。

本 feature は以下の 3 つのサブ機能で構成される：

1. **setup** — 文明カテゴリの作成（建国）  
2. **admin** — 管理者の追加・削除（統治）  
3. **register（削除予定）** — 開発初期のユーザー手動登録（現在は非推奨）

---

# 2. サブ機能一覧

## 2-1. setup（文明カテゴリ作成）

### コマンド
```
/setup name:<string>
```

### 実行条件
- 実行者：Discord の **ManageChannels 権限**  
- BOT：ManageChannels 権限が必要  
- DM では使用不可

### 処理内容
1. カテゴリ名を生成  
   - `╭──── ⡇{name}`
2. カテゴリを作成
3. settings に category_id が存在するか確認  
   - 既に存在 → エラー
4. 以下のチャンネルを作成：

| チャンネル名 | 種類 |
|--------------|------|
| 🔔｜アナウンス | Text |
| 📝｜クエスト掲示板 | Forum |
| 📜｜ログ | Text |
| 📊｜ランキング | Text |
| 📕｜攻略本 | Forum |
| 📗｜フリーフォーラム | Forum |
| 💬｜雑談 | Text |

5. settings に保存  
6. 初代管理者として実行者を admins に登録  
7. ランキング初期メッセージを送信  
8. 成功メッセージを返す

---

## 2-2. admin（管理者追加・削除）

### コマンド
```
/admin add user:@target
/admin remove user:@target
```

### 実行条件
- 文明カテゴリ内で実行  
- settings に category_id が存在  
- 実行者が admins テーブルに登録されている（文明BOT管理者）

### 処理内容
#### add
```
INSERT INTO admins (category_id, user_id)
ON CONFLICT DO NOTHING
```

#### remove
```
DELETE FROM admins WHERE category_id = $1 AND user_id = $2
```

### 出力
- `{username} さんを管理者に追加しました。`
- `{username} さんを管理者から削除しました。`

---

## 2-3. register（削除予定 / deprecated）

### 状態
- **開発初期に使用されていたユーザー手動登録機能**
- 現在の正式フロー（interview → profile）では使用しない
- コード上は残っているが、**削除予定**

### コマンド
```
/register
```

### 実行条件
- Discord の **Administrator 権限** が必要  
- 文明カテゴリとは無関係

### 処理内容
1. users テーブルに user_id が存在するか確認  
2. 存在する → 「すでに登録されています。」  
3. 存在しない → INSERT  
4. 「{name} さんを登録しました！」

### 操作テーブル
```
users (user_id, name)
```

### 備考
- 面接（interview）をスキップするための開発初期ツール  
- 現在は **正式フロー外**  
- 仕様書では “deprecated（削除予定）” として扱う

---

# 3. エラー仕様（共通）

| エラー | 条件 | 表示 |
|--------|------|------|
| 文明カテゴリ外 | getCategoryId が null | 「文明カテゴリ内で実行してください。」 |
| 文明未登録 | settings に category_id が存在しない | 「このカテゴリは文明として登録されていません。」 |
| 管理者ではない | admins に user_id が存在しない | 「あなたはこの文明の管理者ではありません。」 |
| BOT 権限不足 | BOT に ManageChannels がない | 「BOT に `チャンネル管理` 権限がありません。」 |
| register 重複 | users に user_id が存在 | 「すでに登録されています。」 |

---

# 4. 将来拡張（Future Work）
- register の完全削除  
- 管理者権限の細分化  
- 管理者ログの追加  
- 文明カテゴリのテンプレート化


========================================
# 08-02 Quests Feature.txt
========================================

# 08-02_quests  
文明BOT：クエスト機能 仕様書（実装完全準拠）

---

# 🎯 概要

クエストは文明内の活動を促進するための中心機能。  
各クエストは **Forum スレッド** として作成され、  
**embed（クエストカード）＋ボタン** が本体となる。

クエストは以下の 2 種類：

| 種類 | 説明 |
|------|------|
| **single** | 1 回だけ達成できる。達成すると自動で終了（closed）する。 |
| **loop** | 何度でも達成できる。終了しない。 |

---

# 🧩 データ構造（DB）

## quests
| カラム | 説明 |
|--------|------|
| id | クエストID |
| category_id | 文明カテゴリ |
| title | タイトル |
| description | 説明 |
| points | ポイント |
| type | single / loop |
| status | active / closed |
| forum_thread_id | スレッドID |
| issuer_id | 発行者（Discord ID） |
| message_id | embed メッセージID |
| created_at | 作成日時 |

### 重要仕様
- **completed 状態は存在しない**
- 完了は quest_logs に記録されるだけ
- single は完了時に status = closed になる
- loop は完了しても active のまま

---

## quest_logs
| カラム | 説明 |
|--------|------|
| user_id | 達成者 |
| quest_id | クエストID |
| points | 付与ポイント |
| created_at | 達成日時 |

### 重要仕様
- **loop の達成回数は quest_logs の件数で決まる**
- single は quest_logs が 1 件あれば再達成不可

---

## users
- total_points  
- weekly_points  
- weekly_tasks_created  
- weekly_tasks_completed  

### 重要仕様
- 完了時に weekly_tasks_completed +1  
- create 時に weekly_tasks_created +1  
- users に存在しない場合は自動登録される

---

## user_stats（ランキングキャッシュ）
- total_point  
- weekly_point  

### 重要仕様
- 完了時にポイント加算  
- ランキングは user_stats を参照

---

# 🧩 クエストのライフサイクル

---

# 1. 作成（create）

### 入力項目
- title（必須）
- description（任意）
- points（1〜9999）
- type（single / loop）

### 処理フロー
1. 文明カテゴリ判定  
2. settings 取得  
3. Forum スレッド作成  
4. quests に INSERT（status = active）  
5. embed + ボタン生成  
6. embed をスレッドに送信  
7. message_id を DB に保存  
8. ログチャンネル通知  
9. 実行者に ephemeral 返信  

### スレッド構造
- 1通目：固定文言「📝 クエストが作成されました！」  
- 2通目：embed（クエスト本体）

---

# 2. 編集（edit）

### 編集可能項目
- title  
- description  
- points  

### 編集不可項目
- type  
- status  
- issuer  
- forum_thread_id  
- message_id  

### 条件
- 文明カテゴリ内  
- 管理者のみ  
- スレッド内で実行  

### 仕様
- 空欄は変更なし（COALESCE）  
- スレッド名も更新  
  - active → タイトルのみ  
  - closed → `✅ タイトル`  
- embed を再生成して更新  
- ボタン再生成  
- ログ通知  

### 注意
- **実装上、closed のクエストも編集可能**

---

# 3. 達成（complete）

### 共通処理
- 文明カテゴリ判定  
- settings 取得  
- closed クエストは達成不可  
- users に自動登録  
- quest_logs に追加  
- user_stats にポイント加算  
- weekly_tasks_completed +1  
- ログ通知  
- ランキング更新  

---

## single の場合

### 追加仕様
- 二重達成不可（quest_logs に既にあれば拒否）
- 完了後に status = closed  
- スレッド名を `✅ タイトル` に変更  
- 終了メッセージ送信  
- embed を closed 状態に更新  
- スレッドをロック & アーカイブ  

---

## loop の場合

### 追加仕様
- 何度でも達成可能  
- status は active のまま  
- embed も active のまま  
- スレッドは閉じない  
- 達成回数は quest_logs の件数で決まる  

---

# 4. 終了（close）

### 条件
- 文明カテゴリ内  
- 管理者のみ  
- スレッド内で実行  

### 処理
- status = closed  
- embed を closed 状態に更新  
- 終了メッセージ送信  
- スレッド名を `✅ タイトル` に変更  
- スレッドをロック  
- スレッドをアーカイブ  
- ログ通知  

### 重要
- **ポイント付与なし**  
- **single の完了とは別概念**

---

# 🧩 embed（クエストカード）

createQuestEmbed により生成される。

### 表示項目
- タイトル  
- 説明  
- ポイント  
- 種類（single / loop）  
- ステータス（active / closed）  
- 達成回数（loop のみ）  

### ボタン
- 編集（管理者のみ）  
- 完了（active のみ）  
- 終了（管理者のみ）  

### closed の場合
- 完了ボタンは disable  
- ステータスは “終了済み”  
- スレッド名は `✅ タイトル`

---

# 🧩 ランキング

### 更新タイミング
- クエスト完了時（single / loop 共通）

### 参照元
- user_stats（キャッシュ）

### 更新内容
- total_point  
- weekly_point  
- 複合ランキング（rankingService.updateRankingCombined）

---

# 🧩 仕様の確定ポイント（実装準拠）

- completed 状態は存在しない  
- single は完了時に自動で closed  
- loop は終了しない  
- 完了ログは quest_logs のみ  
- 達成回数は quest_logs の件数  
- embed は message_id で安定更新  
- closed でも編集可能（実装上）  
- close はポイント付与なし  
- create / complete / close は必ずログ通知  
- スレッドは single 完了時と close 時にロック & アーカイブ


========================================
# 08-03_Ranking Feature.txt
========================================

# 08-03_ranking 
文明BOT：ランキング機能 仕様書（実装完全準拠＋既知の懸念点を含む）

---

# 🎯 概要

ランキングは文明内の活動量を可視化するための機能。  
ポイントは **クエスト達成時** に付与され、  
ランキングは **user_stats テーブル** を参照して生成される。

ランキングは以下の 3 種類を統合した **複合ランキング** として表示される：

1. **総合ポイントランキング（total_point）**  
2. **週間ポイントランキング（weekly_point）**  
3. **週間サマリー（weekly_tasks_created / weekly_tasks_completed）**

これらをまとめて 1 つの embed として表示する。

---

# 🧩 データ構造（DB）

## user_stats（ランキングの本体）
| カラム | 説明 |
|--------|------|
| user_id | ユーザーID |
| category_id | 文明カテゴリ |
| total_point | 総合ポイント |
| weekly_point | 週間ポイント |
| updated_at | 最終更新日時 |
| PRIMARY KEY (user_id, category_id) |

### 重要仕様
- ランキングは **user_stats** を参照する  
- クエスト達成時に自動で加算される  
- weekly_point は週次リセット対象

---

## users（週間タスク数の集計に使用）
| カラム | 説明 |
|--------|------|
| user_id | ユーザーID |
| name | 表示名 |
| weekly_tasks_created | 今週作成したクエスト数 |
| weekly_tasks_completed | 今週達成したクエスト数 |

### 重要仕様
- weekly_tasks_completed はクエスト達成時に +1  
- weekly_tasks_created はクエスト作成時に +1  
- ランキングのサマリーに使用される

---

## system（週次リセット管理）
| key | value |
|-----|--------|
| weekly_reset_key | 現在の週を示すキー |

---

# ⚠️ 既知の懸念点（実装上の問題点）

この仕様書は **現状の実装を忠実に反映** しているため、  
以下の “実装上の懸念点” も仕様として明記する。

---

## ❗ 懸念点①：`users.total_points` / `users.weekly_points` は実装で一切使用されない

現行 DB には以下のカラムが存在する：

- `users.total_points`
- `users.weekly_points`

しかし実装では：

- ポイント加算 → **user_stats**  
- ランキング参照 → **user_stats**  
- users のポイントカラムは **読み書きされない**

### → **完全に未使用カラムであり、削除推奨**

---

## ❗ 懸念点②：週間サマリーは “文明ごと” ではなく “全ユーザー合計”

`getWeeklySummary()` の SQL：

```sql
SELECT
  SUM(weekly_tasks_created),
  SUM(weekly_tasks_completed)
FROM users
```

category_id で絞っていないため：

- 文明 A のランキングに  
- 文明 B の週間タスク数も含まれる

### → **仕様としては「全文明合計」だが、意図と異なる可能性あり**

---

## ❗ 懸念点③：ランキングチャンネルのメッセージは毎回全削除

rankingService.updateRankingCombined():

- チャンネル内のメッセージを **全削除**
- embed を **1 つだけ再投稿**

### → メッセージ履歴が残らない  
### → 固定メッセージ方式ではない

---

# 🧩 ランキング更新のタイミング

ランキングは以下のタイミングで更新される：

| タイミング | 説明 |
|------------|------|
| **クエスト達成時（complete）** | 毎回即時更新される |
| **/ranking コマンド実行時** | 手動更新 |
| **/ranking-weekly コマンド実行時** | 手動更新 |
| **rankingService.updateRankingCombined() 呼び出し時** | 内部処理で更新 |

---

# 🧩 ランキングの構成（複合ランキング）

rankingService.updateRankingCombined() により、  
以下の 3 つのランキングが 1 つの embed にまとめられる。

---

## 1. 総合ポイントランキング（total_point）

### 参照元
```
SELECT * FROM user_stats
ORDER BY total_point DESC
```

### 表示形式
```
#1 <@userId> — **1200pt**
#2 <@userId> — **900pt**
```

---

## 2. 週間ポイントランキング（weekly_point）

### 参照元
```
SELECT * FROM user_stats
ORDER BY weekly_point DESC
```

### 表示形式
```
#1 <@userId> — **240pt**
#2 <@userId> — **180pt**
```

---

## 3. 週間サマリー（全ユーザー合計）

### 参照元
```
SELECT SUM(weekly_tasks_created), SUM(weekly_tasks_completed)
FROM users
```

### 表示形式
```
今週のクエスト作成数: **X 件**
今週のクエスト達成数: **Y 件**
```

---

# 🧩 ランキングの表示場所

ランキングは **settings.ranking_channel_id** に紐づくチャンネルに表示される。

### 仕様
- ランキングは **常に1メッセージのみ存在する**
- updateRankingCombined() は **チャンネル内のメッセージを全削除 → embed を再投稿**

---

# 🧩 embed の仕様（createCombinedRankingEmbed）

| 項目 | 内容 |
|------|------|
| タイトル | 文明ランキング（総合＋週間） |
| 色 | `#D2B48C` |
| フィールド1 | 🏆 総合ランキング（リアルタイム） |
| フィールド2 | 📅 週間ランキング |
| フィールド3 | 文明の今週の動き |
| ユーザー表示 | `<@userId>`（メンション） |
| ポイント表示 | `**太字**` |
| タイムスタンプ | 現在時刻 |

---

# 🧩 週次リセット

rankingService.ensureWeeklyResetIfNeeded() により自動判定される。

### リセット対象
- users.weekly_tasks_created = 0  
- users.weekly_tasks_completed = 0  
- user_stats.weekly_point = 0  

### リセット判定
- system.weekly_reset_key と現在の週キーを比較

---

# 🧩 仕様の確定ポイント（実装準拠）

- ランキングは user_stats / users を参照  
- クエスト完了時に自動更新  
- 複合ランキングとして 1 つの embed にまとめる  
- ranking_channel_id に常に 1 メッセージのみ存在  
- updateRankingCombined() が常に最新状態を維持  
- /ranking /ranking-weekly は管理者のみ  
- close（終了）ではランキングは更新されない  
- weekly_point / weekly_tasks は週次リセット対象  

---

# ⚠️ 既知の懸念点（再掲）

1. **users.total_points / users.weekly_points は未使用（削除推奨）**  
2. **週間サマリーは文明ごとではなく全ユーザー合計**  
3. **ランキングチャンネルのメッセージは毎回全削除される**


========================================
# 08-04 interview Feature.txt
========================================

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


========================================
# 08-05 Profile Feature.txt
========================================

# 08-05_profile.md  
文明BOT：プロフィール（Profile）機能 仕様書  
（実装完全準拠＋既知の懸念点を含む）

---

# 🎯 概要

プロフィール機能は、メンバーが自分の **MBTI** と **デバイス** を選択し、  
文明BOTの「棚文化」に沿って **ロールとして可視化する仕組み**。

プロフィール情報は **DB ではなくロールのみで管理**される。

---

# 🧩 ディレクトリ構造（実装）

```
📦 profile
 ┗ 📂commands
    ┗ 📜profileSetup.ts
```

ロール付与処理は `src/index.ts` の `interactionCreate` 内に実装されている。

---

# 🟦 1. プロフィール UI 配信（/profile-setup）

## ✔ コマンド
```
/profile-setup
```

## ✔ 実行者
- 管理者（権限チェックはないが、運用上管理者のみが使う想定）

## ✔ 動作
- 固定チャンネル（ID: `1485613648784396329`）に  
  **プロフィール設定 UI（メッセージ＋セレクトメニュー）** を送信する。

## ✔ UI の構成
### 1. メッセージ本文（文明BOT文化に寄せた説明）
- プロフィールの目的  
- 棚文化との関連  
- MBTI とデバイスの説明  
- 気軽に変更できることを強調

### 2. MBTI セレクトメニュー
- customId: `select_mbti`
- **単一選択（1つ）**
- 16タイプすべてがロール ID として value に設定されている

### 3. デバイス セレクトメニュー
- customId: `select_device`
- **複数選択可（0〜2）**
- PC / Mobile の2種類

---

# 🟫 2. MBTI 選択時の処理（interactionCreate）

## ✔ トリガー
```
interaction.isStringSelectMenu() && interaction.customId === "select_mbti"
```

## ✔ 処理内容
1. 既存の MBTI ロール（16種類）をすべて remove  
2. 新しく選択された MBTI ロールを add  
3. 応答（ephemeral）  
   ```
   MBTI を更新しました。
   ```

## ✔ 確定仕様
- **MBTI は必ず 1 つだけ持つ**
- 変更時は古い MBTI が必ず消える
- ロール ID はコードにハードコードされている

---

# 🟨 3. デバイス選択時の処理（interactionCreate）

## ✔ トリガー
```
interaction.customId === "select_device"
```

## ✔ 処理内容
1. 既存のデバイスロール（PC / Mobile）を remove  
2. 選択されたロールを add  
3. 応答（ephemeral）  
   ```
   デバイス情報を更新しました。
   ```

## ✔ 確定仕様
- **デバイスは 0〜2 個選べる**
- PC と Mobile の両方を選んでもよい
- どちらも選ばない（0個）も許可されている

---

# 🟩 4. プロフィール情報の管理方式

## ✔ DB は使用しない
- プロフィール情報は **ロールのみ** で管理される
- プロフィール表示 embed などは存在しない

## ✔ プロフィールの実体
- MBTI → 16種類のいずれか1つのロール  
- デバイス → PC / Mobile のロール（0〜2）

---

# 🟧 5. プロフィール UI の送信仕様

- `/profile-setup` を実行すると UI が送信される  
- 既存メッセージは削除しない  
- embed ではなく **content + components**  
- 実行者にだけ ephemeral で通知  
- UI は静かにチャンネルに置かれる

---

# 🟫 6. プロフィール機能のライフサイクル（まとめ）

```
/profile-setup（管理者）
        ↓
プロフィール UI がチャンネルに送信される
        ↓
ユーザーが MBTI を選ぶ → MBTI ロールが1つだけ付く
        ↓
ユーザーがデバイスを選ぶ → PC/Mobile ロールが付く
```

---

# ⚠️ 既知の懸念点（実装上の問題点）

## ❗ 1. ロール ID がすべてハードコード
- MBTI 16種類  
- デバイス 2種類  
- 変更時はコード修正が必要  
- 設定ファイル化されていない

---

## ❗ 2. プロフィール情報はロールのみで管理
- DB に保存されない  
- プロフィール表示機能が存在しない  
- 「プロフィールを確認する」手段はロール一覧を見るしかない

---

## ❗ 3. デバイス選択は 0 個も許可されている
- 「デバイスなし」状態が発生する  
- 意図した仕様かは不明  
- 必要なら MinValues を 1 に変更可能

---

## ❗ 4. `/profile-setup` の送信先チャンネルもハードコード
- サーバー移行時にコード修正が必要  
- 設定ファイル化されていない

---

## ❗ 5. UI の再送信時に古い UI が残る
- ranking のように「メッセージ全削除 → 再送信」ではない  
- `/profile-setup` を複数回実行すると UI が増える

---

# 🟦 仕様の確定ポイント（実装準拠）

- プロフィールは **MBTI（単一）＋デバイス（複数）**  
- UI は `/profile-setup` で送信  
- 選択時はロール付与で管理  
- DB は使用しない  
- ロール ID はハードコード  
- UI の送信先チャンネルもハードコード  
- 既存 UI は削除されない
