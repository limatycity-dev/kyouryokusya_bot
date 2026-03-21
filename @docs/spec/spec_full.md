

---
# 00_overview.md

# 00_overview — プロジェクト概要

## プロジェクト名
協力者求むBOT

## 目的
協力者求む Discord 内での活動を支援し、  
メンバーの行動を活性化させるための BOT を構築する。

Discord という場で自然に「動きたくなる」「続けたくなる」環境を作り、  
コミュニティ全体の活動量と文化を底上げすることを目的とする。

---

## 解決したい課題
Discord だけでは、以下のような課題が発生しやすい。

- メンバーのモチベーション管理が難しい  
- 誰が何を頑張っているかが見えにくい  
- 活動が属人化し、継続しづらい  
- 成果や努力が可視化されず、達成感が薄い  

協力者求むBOTは、これらの課題を埋める「モチベーション維持装置」として機能する。

---

## 主要機能

### ● カテゴリ管理（挑戦中の活動の分類）
- メンバーが取り組む活動をカテゴリとして整理  
- 活動の方向性を明確化し、取り組みやすくする

### ● クエスト管理（課題・タスク管理）
- メンバーが挑戦するタスクをクエストとして登録  
- 進行状況を管理し、達成までの流れを可視化

### ● ポイント管理（モチベ維持装置）
- クエストを行った際にポイントを付与  
- 活動量を数値化し、努力を積み上げられる仕組みを提供

### ● ランキング・レポート機能（努力の見える化）
- ポイントランキングで活動量を可視化  
- 週次レポートで「今週の文明の動き」を記録  
- メンバーの努力が自然に共有され、文化として定着する

---

## 世界観・文化
協力者求むBOTは、単なるタスク管理ツールではなく  
**「文明の発展を記録し、文化を育てる装置」** として設計されている。

- メンバーの行動が文明の成長として可視化される  
- 週次レポートは「文明の記録」として残る  
- ポイントは努力の証であり、文化の一部  
- 活動が自然に共有され、コミュニティの一体感が生まれる  

BOTはコミュニティの“文化の土台”として機能する。

---

## 技術スタック
- TypeScript  
- PostgreSQL  
- pg（PostgreSQL クライアント）  
- Discloud（ホスティング）  

---

## 今後の拡張予定（任意）
- 週次レポートの自動投稿  
- Web ダッシュボードとの連携  
- 活動ログの可視化  
- 文明の歴史アーカイブ化  

---

## 文明の共通 UI 原則（Embed 使用基準）

本 BOT の UI は、文明としての統一感・視認性・文化的美しさを重視し、
以下の原則に従って **Embed と通常テキストを使い分ける**。

### Embed を使用するケース（必須または推奨）

#### ● 文明の状態を可視化するもの（必須）
文明の進行状況や構造を表す情報は、すべて Embed を使用する。

- クエスト作成（quest-create）
- クエスト編集（quest-edit）
- クエスト完了（quest-complete）
- クエスト終了（quest-close）
- ランキング（ranking / ranking-weekly）
- 週次レポート
- 文明のセットアップ（setup）

理由：  
情報量が多く、視覚的な構造化が必要であり、文明の UI として統一されるべきため。

#### ● エラーメッセージ（推奨）
- 赤系カラーの Embed を使用する  
- ユーザーに明確にエラーを伝えるため  
- 文明の UI を統一するため

#### ● 文明の重要イベント（推奨）
- setup 完了  
- 週次リセット完了  
- 大きな状態変化の通知  

---

### Embed を使用しないケース（テキストで十分）

#### ● 軽い通知・補助的な返答
- register（ユーザー登録）
- admin コマンドの軽い設定変更
- 内部的な成功通知（ユーザーに見せる必要がないもの）

理由：  
情報量が少なく、Embed を使うほどの構造化が不要なため。

---

### UI の統一原則

- 成功メッセージは **青系 Embed** を推奨  
- エラーメッセージは **赤系 Embed** を推奨  
- 文明の状態を表す情報は **必ず Embed**  
- 軽い通知は **テキストでよい**  
- UI の統一は文明の一貫性を保つための重要な原則である

---

## 開発方針：カテゴリID取得の標準ルール（必須）

文明BOTは、すべての文明データを Discord のカテゴリ（CategoryChannel）単位で管理する。  
そのため、各コマンドは「現在のチャンネルがどのカテゴリに属しているか」を正しく判定する必要がある。

### ■ Discord.js の型仕様による問題点
`interaction.channel` は以下の複数の型を取り得る：

- TextChannel
- ThreadChannel
- ForumChannel
- VoiceChannel
- StageChannel
- DMChannel

これらは `TextBasedChannel` として扱われるため、  
TypeScript 上では **parentId が存在しない型が混在する**。

そのため、`interaction.channel.parentId` を直接参照すると  
**「プロパティ 'parentId' は型 'TextBasedChannel' に存在しません」**  
というエラーが発生する。

### ■ 文明BOTにおける標準方針
この問題を回避し、全コマンドで統一した動作を保証するため、  
文明BOTでは **カテゴリID取得の共通関数 `getCategoryId()` を必ず使用する**。

### ■ コマンド実装ルール
すべてのコマンドは、実行時に以下のチェックを行う：

1. `getCategoryId(interaction.channel)` を呼び出す  
2. null の場合は  
   **「このコマンドは文明カテゴリ内で実行してください。」**  
   を返して終了する  
3. 取得した category_id を DB の settings と照合する

---

## 開発方針：仕様書修正時の出力ルール（必須）

文明BOTの仕様書（spec_full.md）に対する修正提案・追記・変更案を提示する際、  
AI は **必ずコードブロック（```md ... ```）で出力する**。

### ■ このルールの目的
- 修正内容をそのままコピペして反映できるようにするため  
- 差分管理を容易にするため  
- 仕様書の整合性を保つため

### ■ 運用ルール
- 修正対象はすべてコードブロックで提示する  
- コードブロック外に説明文を置くことは許可されるが、修正対象は必ずコードブロック内に含める  
- コードブロックの言語指定は内容に応じて `md`, `ts`, `sql`, `json` など適切なものを使用する


---
# 01_directory_structure.md

# 01_directory_structure — ディレクトリ構造

協力者求むBOT のソースコード構造は、  
「機能ごとにまとまりを作り、長期運用に耐える構造」を目的として設計されている。

以下はプロジェクトの主要ディレクトリ構造である。

---

## /src

### /src/bot
BOT の起動処理を担当するレイヤー。  
機能ロジックは持たず、以下の役割に限定される。

- Discord クライアントの初期化  
- イベントハンドラの登録  
- interactionCreate のルーティング  
- BOT のエントリーポイント（index.ts）

---

### /src/db
データベースアクセスを担当するレイヤー。

- PostgreSQL への接続処理  
- クエリ実行のためのユーティリティ  
- DB クライアントの初期化（client.ts）  
- テスト用スクリプト（test.ts）

---

### /src/features
機能単位でフォルダを分割し、  
それぞれが独立して拡張できる構造になっている。

---

#### /src/features/admin
管理者向けの機能をまとめたレイヤー。

```
/src/features/admin
  ├─ commands
  │    ├─ setup.ts      - 文明の基盤となるカテゴリ作成コマンド
  │    └─ register.ts   - ユーザーの手動登録コマンド
  ├─ admin.ts           - 管理者向け共通処理
```

---

#### /src/features/quests
クエスト（タスク）管理機能。

```
/src/features/quests
  ├─ quest-create.ts
  ├─ quest-create-modal.ts
  ├─ quest-edit-button.ts
  ├─ quest-edit-modal.ts
  ├─ quest-complete-button.ts
  ├─ quest-close-button.ts
  └─ quest-embed.ts
```

- クエスト作成  
- 編集  
- 完了  
- クローズ  
- Embed 生成  
- モーダル処理  
など、クエストに関するすべての操作を担当する。

---

#### /src/features/ranking
ランキング機能を構成する複数のサブモジュールを持つ。

```
/src/features/ranking
  ├─ buttons
  │    └─ ranking-button.ts
  ├─ commands
  │    ├─ ranking.ts
  │    ├─ rankingInit.ts
  │    └─ rankingWeekly.ts
  ├─ embeds
  │    ├─ rankingEmbed.ts
  │    └─ weeklyReportEmbed.ts
  ├─ services
  │    ├─ rankingService.ts
  │    └─ weeklyReportService.ts
  ├─ setup
  │    └─ createInitialRankingMessage.ts
  ├─ update
  │    ├─ updateRealtimeRanking.ts
  │    └─ updateWeeklyRanking.ts
  └─ utils
```

- ランキング計算  
- ランキング表示  
- 週次レポート生成  
- 初期メッセージ作成  
- ランキング更新処理  
など、文明の「努力の可視化」を担う中核機能。

---

### /src/types
- 共通で使用する TypeScript の型定義  
- DB レコード型、ユーザー型など  
- 例：user.ts

---

### /src/utils
- プロジェクト全体で使用する汎用関数  
- 例：getUser.ts、getCategoryId.ts  
- 日付処理、フォーマット処理など

---

## /sql
- DB スキーマ定義（schema.sql）  
- マイグレーションや初期化用 SQL  

---

## /@docs
- 仕様書（分割版）  
- 統合仕様書生成用の素材  

```
/@docs
  ├── 00_overview.md
  ├── 01_directory_structure.md
  ├── 02_db_schema.md
  ├── 03_state_machine.md
  ├── 04_commands.md
  ├── 05_ui_spec.md
  ├── 06_operation_flow.md
  └──  07_error_handling.md
```

---

## /@docs/spec
- 統合仕様書（spec_full.md）の出力先  
- Githubにて管理し、毎回copilotにはRAWURLにて共有する

---

## プロジェクトルート
- build_spec.js（仕様書統合スクリプト）  
- package.json  


---
# 02_db_schema.md

# 02_db_schema — データベース構造

協力者求むBOT のデータベースは、  
「カテゴリ（文明単位）を中心とした活動管理」を軸に設計されている。

以下は、現在の PostgreSQL スキーマの仕様である。

---

# 1. settings — 活動カテゴリ（文明単位）

活動の“本体”となるカテゴリを管理するテーブル。  
BOT のすべての機能は、この category_id を基点に紐づく。

```sql
CREATE TABLE IF NOT EXISTS settings (
  category_id TEXT PRIMARY KEY,
  quest_board_channel_id TEXT NOT NULL,
  log_channel_id TEXT NOT NULL,
  info_channel_id TEXT NOT NULL,
  ranking_channel_id TEXT,                 -- ランキング表示チャンネル
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ■ 役割
- 文明（カテゴリ）の主キー  
- クエスト掲示板、ログ、ランキングなどのチャンネルIDを保持  
- setup コマンドで自動生成される

---

# 2. quests — クエスト（タスク）

カテゴリごとに発行されるクエストを管理するテーブル。

```sql
CREATE TABLE IF NOT EXISTS quests (
  id SERIAL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES settings(category_id),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,          -- 'single' or 'roop'
  status TEXT NOT NULL,        -- 'active' or 'closed'
  forum_thread_id TEXT NOT NULL,
  issuer_id TEXT NOT NULL,     -- 発行者（Discord user ID）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ■ 役割
- クエストの基本情報  
- 難易度・ポイント・状態管理  
- Discord フォーラムスレッドとの紐づけ  
- 発行者（issuer_id）を記録

---

# 3. quest_logs — クエスト達成ログ

ユーザーがクエストを達成した記録を保持するテーブル。

```sql
CREATE TABLE IF NOT EXISTS quest_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  quest_id INTEGER NOT NULL REFERENCES quests(id),
  points INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ■ 役割
- 誰がどのクエストを達成したか  
- 付与ポイントの記録  
- ランキング計算の基礎データ  
- users と quests の中間テーブルとして機能

---

# 4. users — ユーザー情報（累積ポイント）

ユーザーの累積ポイントと週間統計を管理するテーブル。

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',           -- Discord username
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,         -- 週間ポイント
  weekly_tasks_created INTEGER DEFAULT 0,  -- 週間作成数
  weekly_tasks_completed INTEGER DEFAULT 0,-- 週間完了数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ■ 役割
- ユーザーの累積ポイント  
- 週間ランキング用の統計値  
- register コマンド or 自動登録で作成される

---

# 5. admins — カテゴリ管理者

カテゴリごとの管理者を記録するテーブル。

```sql
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES settings(category_id),
  user_id TEXT NOT NULL
);
```

### ■ 役割
- setup 実行者を自動登録  
- 管理者権限の判定に使用  
- 複数管理者に対応

---

# 6. system — グローバル設定

BOT 全体に関わる設定を保持するテーブル。

```sql
CREATE TABLE IF NOT EXISTS system (
  key TEXT PRIMARY KEY,
  value TEXT,                    -- NULL 許可（初期状態は空）
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ■ 役割
- BOT 全体の設定値  
- 週次レポートの最終実行時刻など  
- キーバリュー形式で柔軟に拡張可能

---

# 7. テーブル間の関係図（概念）

```
settings (category)
   │ 1
   │
   ├───< quests
   │        │ 1
   │        └───< quest_logs >─── users
   │
   └───< admins
```

- settings を中心に文明が構成される  
- quests は settings に属する  
- quest_logs は quests と users を結ぶ  
- admins は settings の管理者を定義する  

---

# 8. 今後の拡張予定（任意）

- weekly_stats テーブルの追加（履歴保存用）  
- system のキー体系の整理  
- users の統計値の自動リセット処理  


---
# 03_state_machine.md

# 03_state_machine — 状態遷移仕様

協力者求むBOT の中心となる「クエスト（quests）」は、  
明確な状態遷移（State Machine）を持つ。

この章では、クエストのライフサイクルを  
**状態（State）** と **遷移（Transition）** に分けて定義する。

---

# 1. クエストの状態一覧

クエストは以下の 2 状態を持つ。

| 状態 | 説明 |
|------|------|
| **active** | 進行中のクエスト。ユーザーが達成できる状態。 |
| **closed** | 完了または終了したクエスト。編集不可。 |

※ DB の `quests.status` に対応。

---

# 2. 状態遷移図（概念）

```
┌────────────┐
│  active    │
└─────┬──────┘
      │ 完了（complete）
      │ クローズ（close）
┌─────▼──────┐
│   closed   │
└────────────┘
```

---

# 3. 状態遷移の詳細

## 3.1 active → closed

### ■ 遷移トリガー
- クエスト完了ボタン（quest-complete-button.ts）
- クエストクローズボタン（quest-close-button.ts）
- 管理者による強制終了（将来拡張）

### ■ 遷移時の処理
- quest_logs に達成ログを追加（完了時のみ）
- users のポイントを加算
- weekly_points / weekly_tasks_completed を更新
- ranking のリアルタイム更新を実行
- スレッドをロック（必要に応じて）

### ■ 遷移後の状態
- status = "closed"
- 編集不可
- 再度 active に戻ることはない（不可逆）

---

# 4. クエスト作成フロー（状態遷移前の準備）

クエストは以下の手順で生成される。

```
quest-create → quest-create-modal → quest-create.ts → DB INSERT → active 状態で誕生
```

### ■ 作成時の処理
- quests にレコード追加（status = "active"）
- forum_thread_id を保存
- issuer_id を保存
- weekly_tasks_created を加算
- ranking のリアルタイム更新を実行

---

# 5. クエスト編集フロー（active 状態のみ）

```
quest-edit-button → quest-edit-modal → quest-edit-modal.ts → DB UPDATE
```

### ■ 編集可能な項目
- title  
- description  
- points  
- type  

### ■ 編集不可の項目
- status  
- category_id  
- issuer_id  
- forum_thread_id  

### ■ 制約
- closed 状態では編集不可

---

# 6. クエスト完了フロー（active → closed）

```
quest-complete-button → quest-complete-button.ts → quest_logs INSERT → users UPDATE → ranking UPDATE → closed
```

### ■ 完了時の処理
- quest_logs にログ追加  
- users.total_points を加算  
- users.weekly_points を加算  
- users.weekly_tasks_completed を加算  
- ランキングのリアルタイム更新  
- スレッドに完了メッセージ投稿（実装依存）

---

# 7. クエストクローズフロー（active → closed）

```
quest-close-button → quest-close-button.ts → DB UPDATE → closed
```

### ■ クローズ時の処理
- quest_logs は追加されない  
- ポイント加算なし  
- スレッドをロック（必要に応じて）

---

# 8. 状態遷移の不可逆性

クエストは一度 closed になると、  
**active に戻ることはできない。**

理由：
- ポイント計算の整合性を保つため  
- ランキングの再計算を避けるため  
- 文明の「記録」を改変しないため  

---

# 9. 将来の拡張（任意）

- 状態「archived」の追加（古いクエストの整理用）  
- 状態「draft」の追加（作成前の下書き）  
- 状態「review」の追加（承認制クエスト）  


---
# 04_commands.md

# 04_commands — コマンド仕様

協力者求むBOT のコマンドは、  
「管理者向け」「ユーザー向け」「ランキング関連」の 3 つの領域に分類される。

本章では、各コマンドの目的・引数・動作・権限を定義する。

---

# 1. 管理者コマンド（/admin）

管理者のみが実行できるコマンド群。  
文明の基盤を整える操作を担当する。

---

## 1.1 /setup  
**カテゴリ（文明単位）を新規作成するコマンド。**

### ■ 目的
- 文明の主キー（category_id）を作成  
- クエスト掲示板、ログ、ランキングなどのチャンネルを自動生成  
- settings テーブルに登録  
- 実行者を admins に登録  

### ■ 権限
- ManageChannels（デフォルト）  
- サーバー内のみ実行可能  

### ■ 引数
| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| name | string | Yes | カテゴリ名（50文字以内） |

### ■ 実行結果
- カテゴリチャンネル作成  
- クエスト掲示板（Forum）作成  
- ログチャンネル作成  
- ランキングチャンネル作成  
- settings に INSERT  
- admins に INSERT  

---

## 1.2 /register  
**ユーザーを手動で登録するコマンド。**

### ■ 目的
- 自動登録前にユーザーを手動で登録したい場合に使用  
- テスト環境や初期導入時に便利  

### ■ 権限
- Administrator  

### ■ 引数
なし（実行者自身を登録）

### ■ 実行結果
- users に INSERT（既に存在する場合はエラー）  
- 名前（username）を保存  

---

# 2. クエストコマンド（/quest）

クエスト（タスク）を作成・編集・完了するためのコマンド群。  
実際にはスラッシュコマンドと UI（ボタン・モーダル）が連携して動作する。

---

## 2.1 /quest-create  
**新しいクエストを作成する。**

### ■ 目的
- クエストを active 状態で生成  
- Forum スレッドを作成  
- quests に INSERT  

### ■ 引数
| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| title | string | Yes | クエスト名 |
| points | number | Yes | ポイント |
| type | string | Yes | 'single' or 'roop' |
| description | string | No | 説明文 |

### ■ 実行結果
- Forum スレッド作成  
- quests に INSERT  
- weekly_tasks_created を加算  
- ランキング更新  

---

## 2.2 クエスト編集（ボタン＋モーダル）
```
quest-edit-button → quest-edit-modal → quest-edit-modal.ts
```

### ■ 目的
- active 状態のクエストを編集する  

### ■ 編集可能項目
- title  
- description  
- points  
- type  

### ■ 実行結果
- quests を UPDATE  

---

## 2.3 クエスト完了（ボタン）
```
quest-complete-button.ts
```

### ■ 目的
- クエストを完了し、ポイントを付与する  

### ■ 実行結果
- quest_logs に INSERT  
- users.total_points を加算  
- users.weekly_points を加算  
- users.weekly_tasks_completed を加算  
- ランキング更新  
- status = "closed"  

---

## 2.4 クエストクローズ（ボタン）
```
quest-close-button.ts
```

### ■ 目的
- クエストをポイント付与なしで終了する  

### ■ 実行結果
- quests.status = "closed"  
- ログ追加なし  
- ランキング更新なし  

---

# 3. ランキングコマンド（/ranking）

文明の「努力の見える化」を担当するコマンド群。

---

## 3.1 /ranking  
**現在のランキングを表示する。**

### ■ 目的
- リアルタイムランキングを Embed で表示  

### ■ 引数
なし

### ■ 実行結果
- rankingEmbed を返信  

---

## 3.2 /rankingInit  
**ランキングチャンネルに初期メッセージを作成する。**

### ■ 目的
- ランキングチャンネルの初期セットアップ  
- メッセージ ID を保存（必要に応じて）  

### ■ 権限
- 管理者のみ（実装依存）

---

## 3.3 /rankingWeekly  
**週間ランキングを表示する。**

### ■ 目的
- weekly_points を元に週間ランキングを生成  
- weeklyReportEmbed を返信  

---

# 4. ボタン・モーダル一覧

BOT はスラッシュコマンドだけでなく、  
UI コンポーネント（ボタン・モーダル）も多用する。

---

## 4.1 ボタン
| ファイル | 役割 |
|----------|------|
| quest-complete-button.ts | クエスト完了 |
| quest-close-button.ts | クエスト終了 |
| quest-edit-button.ts | 編集モーダルを開く |
| ranking-button.ts | ランキング切り替え |

---

## 4.2 モーダル
| ファイル | 役割 |
|----------|------|
| quest-create-modal.ts | クエスト作成 |
| quest-edit-modal.ts | クエスト編集 |

---

# 5. コマンドの権限体系

| コマンド | 権限 |
|----------|------|
| /setup | ManageChannels |
| /register | Administrator |
| /quest-create | 全員 |
| /ranking | 全員 |
| /rankingWeekly | 全員 |
| /rankingInit | 管理者（実装依存） |

---

# 6. 今後の拡張予定（任意）

- /quest-list の追加  
- /quest-search の追加  
- /admin add/remove の追加  
- /rankingMonthly の追加  


---
# 05_ui_spec.md

# 05_ui_spec — UI仕様（Embed / ボタン / モーダル）

協力者求むBOT の UI は、  
「文明の活動を美しく、わかりやすく可視化する」ことを目的として設計されている。

本章では、Embed・ボタン・モーダルなどの UI コンポーネントの仕様を定義する。

---

# 1. クエスト UI

クエストは Forum スレッドを中心に管理され、  
Embed・ボタン・モーダルが連携して動作する。

---

## 1.1 クエスト作成 Embed（quest-embed.ts）

### ■ 目的
- クエストの概要を視覚的に表示する  
- Forum スレッドのトップメッセージとして使用  

### ■ 表示項目
| 項目 | 内容 |
|------|------|
| タイトル | クエスト名 |
| 説明 | description |
| ポイント | points |
| 種類 | type（single / roop） |
| 発行者 | issuer_id |
| 状態 | active |

### ■ デザイン
- ベージュ系の背景色（文明の文化色）  
- 太めのタイトル  
- 情報はフィールドで整理  

---

## 1.2 クエスト操作ボタン

### ■ 完了ボタン（quest-complete-button.ts）
- ラベル：**完了**  
- スタイル：Success（緑）  
- アクション：クエスト完了 → ログ追加 → ランキング更新  

### ■ クローズボタン（quest-close-button.ts）
- ラベル：**終了**  
- スタイル：Danger（赤）  
- アクション：ポイント付与なしで終了  

### ■ 編集ボタン（quest-edit-button.ts）
- ラベル：**編集**  
- スタイル：Primary（青）  
- アクション：編集モーダルを開く  

---

## 1.3 クエスト編集モーダル（quest-edit-modal.ts）

### ■ 目的
- active 状態のクエストを編集する  

### ■ 入力項目
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| title | text | Yes | クエスト名 |
| description | paragraph | No | 説明文 |
| points | number | Yes | ポイント |
| type | text | Yes | 'single' or 'roop' |

### ■ 制約
- closed 状態では開けない  
- 入力値はバリデーションされる  

---

# 2. ランキング UI

ランキングは文明の「努力の可視化」を担う UI。

---

## 2.1 ランキング Embed（rankingEmbed.ts）

### ■ 目的
- 現在のランキングを表示する  

### ■ 表示項目
| 項目 | 内容 |
|------|------|
| タイトル | 現在のランキング |
| 本文 | 1位〜N位のユーザーとポイント |
| 更新時刻 | 自動挿入 |

### ■ デザイン
- シンプルで視認性重視  
- ユーザー名とポイントを整列表示  

---

## 2.2 週間ランキング Embed（weeklyReportEmbed.ts）

### ■ 目的
- 週間ポイントを元にランキングを表示  
- 毎週の活動を振り返るレポートとして機能  

### ■ 表示項目
| 項目 | 内容 |
|------|------|
| タイトル | 週間ランキング |
| 本文 | 週間ポイント上位者 |
| 統計 | 作成数・完了数など |

---

## 2.3 ランキング切り替えボタン（ranking-button.ts）

### ■ 目的
- ランキングの種類を切り替える（例：総合 ↔ 週間）  

### ■ ラベル
- **総合ランキング**
- **週間ランキング**

### ■ スタイル
- Secondary（グレー）

---

# 3. 管理者 UI

---

## 3.1 setup コマンドの返信メッセージ

### ■ 内容
- 作成されたカテゴリ名  
- 作成されたチャンネル一覧  
- 文明の開始を知らせるメッセージ  

### ■ 例
```
カテゴリ **╭──── ⡇〇〇** を作成し、必要なチャンネルをセットアップしました！
```

---

## 3.2 register コマンドの返信

### ■ 内容
- 登録されたユーザー名  
- 既に登録済みの場合はエラーメッセージ  

---

# 4. UI の文化的ルール

協力者求むBOT の UI は以下の文化を持つ。

### ✔ 1. ベージュ系の落ち着いた色を基調とする  
- 文明の温かさと柔らかさを表現  

### ✔ 2. 情報は「フィールド」で整理する  
- Embed の可読性を最大化  

### ✔ 3. ボタンは「操作の意味」で色を統一  
| 色 | 意味 |
|----|------|
| 緑（Success） | 完了・承認 |
| 赤（Danger） | 終了・削除 |
| 青（Primary） | 編集・主要操作 |
| グレー（Secondary） | 切り替え・補助 |

### ✔ 4. モーダルは最小限の入力で済むようにする  
- 操作負荷を減らす  
- 入力ミスを防ぐ  

---

# 5. 今後の拡張（任意）

- クエスト一覧 Embed の追加  
- 月間ランキング Embed の追加  
- 管理者向け UI の統一デザイン化  
- カラーガイドラインの策定  


---
# 06_operation_flow.md

# 06_operation_flow — 運用フロー

協力者求むBOT の運用は、  
「カテゴリ（文明単位）の作成」から始まり、  
「クエストの発行・達成」「ランキング更新」「週次レポート」へと循環する。

本章では、管理者とユーザーがどのように BOT を利用し、  
文明がどのように運用されるかをフローとして定義する。

---

# 1. 文明の開始（カテゴリ作成）

文明の運用は、管理者が `/setup` を実行するところから始まる。

## 1.1 /setup 実行フロー

```
/setup → カテゴリ作成 → チャンネル自動生成 → settings INSERT → admins INSERT
```

### ■ 自動生成されるチャンネル
- クエスト掲示板（Forum）
- ログチャンネル（Text）
- ランキングチャンネル（Text）
- 情報チャンネル（log と同一）

### ■ DB 登録
- settings に category_id とチャンネルIDを保存  
- 実行者を admins に登録  

---

# 2. クエスト運用フロー

文明の中心となるのが「クエスト（タスク）」の運用。

---

## 2.1 クエスト作成フロー

```
/quest-create → モーダル入力 → Forum スレッド生成 → quests INSERT → ランキング更新
```

### ■ 作成時の処理
- Forum スレッドを作成  
- quests にレコード追加（status = active）  
- weekly_tasks_created を加算  
- ランキングのリアルタイム更新  

---

## 2.2 クエスト編集フロー

```
編集ボタン → 編集モーダル → quests UPDATE
```

### ■ 編集可能
- title  
- description  
- points  
- type  

### ■ 制約
- closed 状態では編集不可  

---

## 2.3 クエスト完了フロー（active → closed）

```
完了ボタン → quest_logs INSERT → users UPDATE → ランキング更新 → closed
```

### ■ 完了時の処理
- quest_logs にログ追加  
- users.total_points を加算  
- users.weekly_points を加算  
- users.weekly_tasks_completed を加算  
- ランキング更新  

---

## 2.4 クエストクローズフロー（active → closed）

```
終了ボタン → quests.status = closed
```

### ■ 特徴
- ポイント付与なし  
- ログ追加なし  
- ランキング更新なし  

---

# 3. ランキング運用フロー

ランキングは文明の「努力の可視化」を担う。

---

## 3.1 リアルタイムランキング更新

### ■ トリガー
- クエスト作成  
- クエスト完了  
- クエスト編集（ポイント変更時）  

### ■ 処理
- users.total_points を元にランキングを再計算  
- ランキングチャンネルのメッセージを更新  

---

## 3.2 週間ランキング更新

```
rankingWeekly.ts → weeklyReportEmbed → ランキングチャンネルに投稿
```

### ■ 内容
- weekly_points のランキング  
- 週間の作成数・完了数  
- 活動の振り返り  

---

## 3.3 初期メッセージ作成（/rankingInit）

### ■ 目的
- ランキングチャンネルに固定メッセージを作成  
- 必要に応じてメッセージIDを保存  

---

# 4. ユーザー登録フロー

ユーザーは以下のいずれかで登録される。

---

## 4.1 自動登録（推奨）

### ■ トリガー
- クエスト完了  
- クエスト作成  
- ランキング更新時の参照  

### ■ 処理
- users に存在しない場合、自動で INSERT  

---

## 4.2 手動登録（/register）

### ■ 目的
- 初期導入時の事前登録  
- テスト環境での登録  

---

# 5. ログ運用フロー

ログチャンネルには以下が記録される。

### ■ 記録内容
- クエスト作成  
- クエスト完了  
- クエスト終了  
- ランキング更新（必要に応じて）  

### ■ 目的
- 文明の活動履歴を残す  
- トラブルシューティングに利用  

---

# 6. 週次リセットフロー（weekly_points）

週次ランキングのため、  
毎週特定のタイミングで weekly_* をリセットする。

### ■ 対象
- weekly_points  
- weekly_tasks_created  
- weekly_tasks_completed  

### ■ 実装
- system テーブルに最終リセット時刻を保存  
- rankingWeekly 実行時に必要ならリセット  

---

# 7. 文明のライフサイクル（全体図）

```
setup
  ↓
クエスト作成
  ↓
クエスト達成・終了
  ↓
ランキング更新
  ↓
週次レポート
  ↓
（繰り返し）
```

文明はこのサイクルを繰り返しながら成長していく。

---

# 8. 今後の拡張（任意）

- 月間ランキングの追加  
- クエストのアーカイブ機能  
- 管理者向けダッシュボード  
- 自動リセットのスケジューラ化  


---
# 07_error_handling.md

# 07_error_handling — エラー処理仕様

協力者求むBOT のエラー処理は、  
「ユーザーに優しく、開発者に厳しく」を原則として設計されている。

- ユーザーには簡潔で安全なメッセージを返す  
- 開発者には詳細なログを残す  
- BOT が沈黙しないように必ず返信する  

本章では、エラー処理の方針・実装ルール・各機能の例外パターンを定義する。

---

# 1. 基本方針

## ✔ 1.1 BOT は必ず返信する  
Discord の仕様上、  
**3 秒以内に返信 or defer しないと「問題が発生しました」になる。**

そのため、すべてのコマンド・ボタン・モーダルは  
**try/catch で囲み、catch 内で必ず返信する。**

---

## ✔ 1.2 ユーザーには安全なメッセージを返す  
ユーザー向けのエラーメッセージは以下の形式に統一する。

```
エラーが発生しました。もう一度お試しください。
```

または、機能に応じた簡潔な説明。

---

## ✔ 1.3 開発者には詳細ログを出す  
catch 内では必ず console.error を実行する。

```
console.error("QUEST CREATE ERROR:", error);
```

ログには以下を含める：

- 機能名  
- エラー内容  
- interaction 情報（必要に応じて）  

---

## ✔ 1.4 DB エラーは必ずログに残す  
DB 書き込みは失敗しやすいため、  
**すべての INSERT / UPDATE / SELECT は try/catch 内で実行する。**

---

# 2. コマンドのエラー処理

---

## 2.1 スラッシュコマンド（/setup, /register, /ranking など）

### ■ 原則
- try/catch で囲む  
- catch 内で必ず interaction.reply（ephemeral）  
- ログに機能名を含める  

### ■ 例（setup）

```
try {
  // setup 処理
} catch (error) {
  console.error("SETUP ERROR:", error);
  return interaction.reply({
    content: "セットアップ中にエラーが発生しました。",
    ephemeral: true,
  });
}
```

---

# 3. モーダルのエラー処理

モーダルは特に失敗しやすい（入力値、DB、権限など）。

### ■ 原則
- try/catch  
- interaction.replied / deferred を確認して二重返信を防ぐ  

### ■ 例

```
catch (error) {
  console.error("QUEST CREATE MODAL ERROR:", error);
  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content: "クエスト作成中にエラーが発生しました。",
      ephemeral: true,
    });
  }
}
```

---

# 4. ボタンのエラー処理

ボタンは「押された瞬間に DB 書き込みが走る」ため、  
エラー発生率が高い。

### ■ 原則
- try/catch  
- DB 書き込みは必ずログ  
- 返信は ephemeral  

---

# 5. よくあるエラーと対処方針

---

## 5.1 DB 接続エラー  
**症状：**  
- すべてのコマンドが失敗  
- ログに `ECONNREFUSED` などが出る  

**対処：**  
- db/client.ts の接続設定を確認  
- Discloud の DB が落ちていないか確認  

---

## 5.2 カテゴリ外での操作  
**症状：**  
- 「カテゴリ内で実行してください」エラー  

**原因：**  
- interaction.channel.parentId が settings に存在しない  

**対処：**  
- getCategoryId.ts のロジックを確認  
- settings に正しい category_id が入っているか確認  

---

## 5.3 モーダルの入力値エラー  
**症状：**  
- points が数値でない  
- type が不正  

**対処：**  
- バリデーションを追加  
- エラーメッセージを返す  

---

## 5.4 ランキング更新エラー  
**症状：**  
- ランキングが更新されない  
- rankingService が例外を吐く  

**対処：**  
- users テーブルの weekly_* が NULL でないか確認  
- quest_logs の整合性を確認  

---

# 6. エラー発生時のログフォーマット

ログは以下の形式に統一する。

```
[ERROR] <機能名> <日時>
内容: <error.message>
Stack: <error.stack>
```

例：

```
[ERROR] QUEST COMPLETE 2026-03-20 14:22
内容: Cannot read properties of undefined
Stack: ...
```

---

# 7. Discord 側のエラー（「問題が発生しました」）の回避

このエラーは **BOT 側の例外ではなく、返信が遅れたときに出る UI エラー**。

### ■ 回避方法
- 3 秒以内に reply or defer  
- モーダルは特に defer を検討  
- 長時間処理は deferReply → editReply  

---

# 8. 今後の拡張（任意）

- ログチャンネルへの自動エラー通知  
- エラーコード体系の導入  
- Sentry などの外部ログサービス導入  
