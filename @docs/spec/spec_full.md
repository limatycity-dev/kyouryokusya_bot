

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

（構造）
/src/features/admin  
　commands  
　　setup.ts（文明の基盤となるカテゴリ作成コマンド）  
　　register.ts（ユーザーの手動登録コマンド）  
　admin.ts（管理者向け共通処理）

---

#### /src/features/quests
クエスト（タスク）管理機能。
message_id 対応により、クエスト embed のメッセージを直接参照する安定版構造になった。

（構造）
/src/features/quests  
　quest-create.ts  
　quest-create-modal.ts  
　quest-edit-button.ts  
　quest-edit-modal.ts  
　quest-complete-button.ts  
　quest-close-button.ts  
　quest-embed.ts

（役割）
- クエスト作成（スレッド作成、embed 投稿、message_id を DB に保存）
- 編集（DB の message_id を使って embed を直接編集）
- 完了（ポイント付与、単発クエストの終了処理）
- クローズ（message_id を使って終了状態に更新）
- Embed 生成
- モーダル処理

Discord フォーラムスレッドのシステムメッセージ混在問題を回避するため、
スレッド内のメッセージ検索は行わず、message_id を唯一の参照元とする。

---

#### /src/features/ranking
ランキング機能を構成する複数のサブモジュールを持つ。

（構造）
/src/features/ranking  
　buttons  
　　ranking-button.ts  
　commands  
　　ranking.ts  
　　rankingInit.ts  
　　rankingWeekly.ts  
　embeds  
　　rankingEmbed.ts  
　　weeklyReportEmbed.ts  
　services  
　　rankingService.ts  
　　weeklyReportService.ts  
　setup  
　　createInitialRankingMessage.ts  
　update  
　　updateRealtimeRanking.ts  
　　updateWeeklyRanking.ts  
　utils

（役割）
- ランキング計算
- ランキング表示
- 週次レポート生成
- 初期メッセージ作成
- ランキング更新処理

---

#### /src/features/interview
ギルド参加希望者の面接機能。
ガイドラインチャンネルのボタンから面接を開始し、
応募者と管理者のみが閲覧できる専用チャンネルを生成する。

（構造）
/src/features/interview  
　buttons  
　　start.ts（面接開始ボタン）  
　commands  
　　close.ts（/interview-close）  
　embeds  
　　interviewStart.ts（面接チャンネル初期メッセージ）  
　services  
　　createInterviewChannel.ts（面接チャンネル作成ロジック）  
　　closeInterview.ts（アーカイブ移動ロジック）  
　utils  
　　validateInterviewChannel.ts（面接カテゴリ判定）

（役割）
- 面接開始ボタン → 面接カテゴリ内に専用チャンネルを作成
- 応募者＋管理者のみ閲覧可能に権限設定
- 初期メッセージ送信
- /interview-close → アーカイブカテゴリへ移動
- UI（Embed）生成
- カテゴリ判定ユーティリティ

DB を使用しない運用機能であり、
チャンネルの存在位置（カテゴリ）が状態そのものとなる。

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

（構造）
/@docs  
　00_overview.md  
　01_directory_structure.md  
　02_db_schema.md  
　03_state_machine.md  
　04_commands.md  
　05_ui_spec.md  
　06_operation_flow.md  
　07_error_handling.md

---

## /@docs/spec
- 統合仕様書（spec_full.md）の出力先
- Github にて管理し、毎回 RAW URL で共有する

---

## プロジェクトルート
- build_spec.js（仕様書統合スクリプト）
- package.json


---
# 02_db_schema.md

# 02_db_schema — データベース構造（最終版）

協力者求むBOT のデータベースは、  
「カテゴリ（文明単位）を中心とした活動管理」を軸に設計されている。

以下は、履歴なし・最新仕様に基づく PostgreSQL スキーマの最終版である。

---

# 1. settings — 活動カテゴリ（文明の本体）

文明（カテゴリ）を表す最重要テーブル。  
BOT のすべての機能は、この category_id を基点に紐づく。

@@@
CREATE TABLE settings (
  category_id TEXT PRIMARY KEY,
  quest_board_channel_id TEXT NOT NULL,
  log_channel_id TEXT NOT NULL,
  ranking_channel_id TEXT NOT NULL
);
@@@

### ■ 役割
- 文明（カテゴリ）の主キー  
- クエスト掲示板、ログ、ランキングのチャンネルIDを保持  
- setup コマンドで自動生成される  

---

# 2. quests — クエスト（タスク）

カテゴリごとに発行されるクエストを管理するテーブル。

**★ message_id 対応により、クエスト embed のメッセージIDを保持するようになった。**

@@@
CREATE TABLE quests (
  id SERIAL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES settings(category_id),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,          -- 'single' or 'loop'
  status TEXT NOT NULL,        -- 'active' or 'closed'
  forum_thread_id TEXT NOT NULL,
  issuer_id TEXT NOT NULL,
  message_id TEXT,             -- ★ 追加：クエスト embed のメッセージID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
@@@

### ■ 役割
- クエストの基本情報  
- 難易度・ポイント・状態管理  
- Discord フォーラムスレッドとの紐づけ  
- **message_id により、編集・達成・終了時に embed を直接更新できる（安定版）**

---

# 3. quest_logs — クエスト達成ログ

ユーザーがクエストを達成した記録を保持するテーブル。

@@@
CREATE TABLE quest_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  quest_id INTEGER NOT NULL REFERENCES quests(id),
  points INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
@@@

### ■ 役割
- 誰がどのクエストを達成したか  
- 付与ポイントの記録  
- ランキング計算の基礎データ  

---

# 4. users — ユーザー情報（累積ポイント）

ユーザーの累積ポイントと週間統計を管理するテーブル。

@@@
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  weekly_tasks_created INTEGER DEFAULT 0,
  weekly_tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
@@@

### ■ 役割
- ユーザーの累積ポイント  
- 週間ランキング用の統計値  
- weekly_tasks_* は文明全体の合計を出すための基礎データ  

---

# 5. admins — カテゴリ管理者

カテゴリごとの管理者を記録するテーブル。

@@@
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES settings(category_id),
  user_id TEXT NOT NULL
);
@@@

### ■ 役割
- setup 実行者を自動登録  
- 管理者権限の判定に使用  

---

# 6. system — グローバル設定

BOT 全体に関わる設定を保持するテーブル。

@@@
CREATE TABLE system (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
@@@

### ■ 役割
- BOT 全体の設定値  
- 週次リセットの最終実行時刻など  

---

# 7. user_stats — ランキング高速化キャッシュ（履歴なし版）

ランキング表示を高速化するためのキャッシュテーブル。  
**quest_logs が唯一の真実であり、user_stats は派生データ。**

@@@
CREATE TABLE user_stats (
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  total_point INTEGER DEFAULT 0,
  weekly_point INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, category_id)
);
@@@

### ■ 役割
- ランキング表示の高速化  
- クエスト完了時にリアルタイム更新  
- weekly_point は週次リセット対象  
- 履歴は保持しない（常に最新状態のみ）

### 補足：累計ポイントワイプ機能
- users.total_points は累計ポイントの唯一の正規データである。
- user_stats.total_point は高速化キャッシュであり、ワイプ時には users.total_points と同時に 0 に更新する必要がある。

---

# 8. テーブル間の関係図（概念）

@@@
settings (category)
   │
   ├───< quests
   │        │
   │        └───< quest_logs >─── users
   │
   ├───< admins
   │
   └───< user_stats
@@@

- settings を中心に文明が構成される  
- quests は settings に属する  
- quest_logs は quests と users を結ぶ  
- user_stats はランキング高速化用（履歴なし）  

---

# 9. 今後の拡張予定（任意）

- 月次ランキング（monthly）  
- user_stats の自動再計算ジョブ  
- system のキー体系の整理  


---
# 03_state_machine.md


```md
# 03_state_machine — 状態遷移仕様（最終版）

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

@@@
┌────────────┐
│  active    │
└─────┬──────┘
      │ 完了（complete）
      │ クローズ（close）
┌─────▼──────┐
│   closed   │
└────────────┘
@@@

---

# 3. 状態遷移の詳細

## 3.1 active → closed

### ■ 遷移トリガー
- クエスト完了ボタン（quest-complete-button.ts）
- クエストクローズボタン（quest-close-button.ts）
- 管理者による強制終了（将来拡張）

### ■ 遷移時の処理
- 完了時のみ quest_logs に達成ログを追加  
- users のポイントを加算  
- users.weekly_points / weekly_tasks_completed を更新  
- **user_stats（ランキングキャッシュ）のリアルタイム更新**  
- スレッドをロック（必要に応じて）
- **message_id を使用してクエスト embed を終了状態に更新（安定版）**

### ■ 遷移後の状態
- status = "closed"
- 編集不可
- **再度 active に戻ることはない（不可逆）**

---

# 4. クエスト作成フロー（状態遷移前の準備）

クエストは以下の手順で生成される。

@@@
quest-create → quest-create-modal → quest-create.ts → DB INSERT → active 状態で誕生
@@@

### ■ 作成時の処理
- quests にレコード追加（status = "active"）
- forum_thread_id を保存
- issuer_id を保存
- **BOT が投稿したクエスト embed の message_id を保存（安定版の中核）**
- users.weekly_tasks_created を加算
- user_stats のリアルタイム更新（必要に応じて）

---

# 5. クエスト編集フロー（active 状態のみ）

@@@
quest-edit-button → quest-edit-modal → quest-edit-modal.ts → DB UPDATE
@@@

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
- **embed 更新は message_id を使用して行う（スレッド内検索は行わない）**

---

# 6. クエスト完了フロー（active → closed）

@@@
quest-complete-button
  → quest-complete-button.ts
  → quest_logs INSERT
  → users UPDATE
  → user_stats UPDATE
  → closed
@@@

### ■ 完了時の処理
- quest_logs にログ追加  
- users.total_points を加算  
- users.weekly_points を加算  
- users.weekly_tasks_completed を加算  
- **user_stats（total_point / weekly_point）をリアルタイム更新**  
- スレッドに完了メッセージ投稿  
- **単発クエスト（single）は message_id を使って embed を終了状態に更新**

---

# 7. クエストクローズフロー（active → closed）

@@@
quest-close-button → quest-close-button.ts → DB UPDATE → closed
@@@

### ■ クローズ時の処理
- quest_logs は追加されない  
- ポイント加算なし  
- user_stats の更新なし  
- スレッドをロック  
- **message_id を使って embed を終了状態に更新（安定版）**

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
```



---
# 04_commands.md

# 04_commands — コマンド仕様（最終版）

協力者求むBOT のコマンドは、
「管理者向け」「ユーザー向け」「ランキング関連」「面接関連」の 4 つの領域に分類される。

本章では、各コマンドの目的・引数・動作・権限を定義する。

---

# 1. 管理者コマンド（/admin）

管理者のみが実行できるコマンド群。
文明の基盤を整える操作を担当する。

---

## 1.1 /setup
カテゴリ（文明単位）を新規作成するコマンド。

目的  
- 文明の主キー（category_id）を作成  
- クエスト掲示板、ログ、ランキングなどのチャンネルを自動生成  
- settings テーブルに登録  
- 実行者を admins に登録  

権限  
- ManageChannels（デフォルト）  
- サーバー内のみ実行可能  

引数  
name（string, 必須）: カテゴリ名（50文字以内）

実行結果  
- カテゴリチャンネル作成  
- クエスト掲示板（Forum）作成  
- ログチャンネル作成  
- ランキングチャンネル作成  
- settings に INSERT  
- admins に INSERT  

---

## 1.2 /register
ユーザーを手動で登録するコマンド。

目的  
- 自動登録前にユーザーを手動で登録したい場合に使用  
- テスト環境や初期導入時に便利  

権限  
- Administrator  

引数  
なし（実行者自身を登録）

実行結果  
- users に INSERT（既に存在する場合はエラー）  
- 名前（username）を保存  

---

## 1.3 /reset-total-points（新規）
累計ポイント（users.total_points および user_stats.total_point）をワイプする管理者専用コマンド。

### 目的
- 文明の累計ポイントをリセットし、新しいシーズンや区切りを開始するために使用する。
- ランキングの累計値を初期化し、再スタートを可能にする。

### 権限
- 管理者（Administrator）

### 引数
- なし

### 実行結果
- users.total_points を 0 に更新
- user_stats.total_point を 0 に更新
- ランキングメッセージを再描画（updateRealtimeRanking() を呼び出す）
- 成功メッセージを ephemeral で返す

### エラーパターン
- DB 更新失敗 → 「エラーが発生しました。もう一度お試しください。」（赤系 Embed）

ｰｰｰ

# 2. クエストコマンド（/quest）

クエスト（タスク）を作成・編集・完了するためのコマンド群。
実際にはスラッシュコマンドと UI（ボタン・モーダル）が連携して動作する。

---

## 2.1 /quest-create
新しいクエストを作成する。

目的  
- クエストを active 状態で生成  
- Forum スレッドを作成  
- quests に INSERT  
- クエスト embed の message_id を保存（安定版の中核）

引数  
title（string, 必須）  
points（number, 必須）  
type（string, 必須: single or loop）  
description（string, 任意）

実行結果  
- Forum スレッド作成  
- quests に INSERT  
- BOT が投稿したクエスト embed の message_id を保存  
- users.weekly_tasks_created を加算  
- user_stats のリアルタイム更新  
- ランキング更新  

---

## 2.2 クエスト編集（ボタン＋モーダル）

目的  
- active 状態のクエストを編集する  

編集可能項目  
- title  
- description  
- points  
- type  

実行結果  
- quests を UPDATE  
- message_id を使用して embed を直接更新（スレッド内検索は行わない）

---

## 2.3 クエスト完了（ボタン）

目的  
- クエストを完了し、ポイントを付与する  

実行結果  
- quest_logs に INSERT  
- users.total_points を加算  
- users.weekly_points を加算  
- users.weekly_tasks_completed を加算  
- user_stats を更新  
- ランキング更新  
- status = "closed"  
- 単発クエスト（single）は message_id を使って embed を終了状態に更新  

---

## 2.4 クエストクローズ（ボタン）

目的  
- クエストをポイント付与なしで終了する  

実行結果  
- quests.status = "closed"  
- ログ追加なし  
- ランキング更新なし  
- message_id を使って embed を終了状態に更新  

---

# 3. ランキングコマンド（/ranking）

文明の「努力の見える化」を担当するコマンド群。

ランキングは専用チャンネル（settings.ranking_channel_id）に集約し、以下の運用方針を採用する。

- 総合ランキング（リアルタイム）  
  - チャンネル内に常に 1 メッセージのみ  
  - クエスト完了時に自動更新  
  - refresh ボタンあり  

- 週間ランキング（履歴なし）  
  - チャンネル内に常に 1 メッセージのみ  
  - 週切り替え時に上書き更新  
  - ボタンなし  

---

## 3.1 /ranking
総合ポイントランキングを表示する。

挙動  
- ランキングチャンネルを取得  
- チャンネル内のメッセージをすべて削除  
- updateRealtimeRanking() を呼び出し、最新ランキングを投稿  
- ボタンは refresh のみ  

---

## 3.2 /ranking-weekly
週間ランキングを表示する。

挙動  
- ランキングチャンネルを取得  
- チャンネル内のメッセージをすべて削除  
- updateWeeklyRanking() を呼び出し、最新週間ランキングを投稿  
- ボタンなし  

---

## 3.3 /ranking-init
ランキングチャンネルを初期化する。

挙動  
- ランキングチャンネルを取得  
- メッセージをすべて削除  
- 「ランキングチャンネルを初期化しました」を返す  

---

# 4. 面接コマンド（/interview）

ギルド参加希望者の面接を行うためのコマンド群。

---

## 4.1 /interview-close
面接チャンネルをアーカイブカテゴリへ移動する。

目的  
- 面接が完了したチャンネルをアーカイブへ移動する  

権限  
- 管理者のみ  

引数  
なし

挙動  
- 実行されたチャンネルのカテゴリを確認  
- 面接カテゴリ以外で実行された場合はエラー  
- 面接アーカイブカテゴリへ移動  
- 成功メッセージを返す（ephemeral）

エラー例  
- 「このチャンネルは面接チャンネルではありません。」

---

# 5. UI コンポーネント一覧

## 5.1 ボタン

| ファイル | 役割 |
|---------|------|
| quest-complete-button.ts | クエスト完了 |
| quest-close-button.ts | クエスト終了 |
| quest-edit-button.ts | 編集モーダルを開く |
| ranking-refresh-button.ts | ランキング再描画 |
| start.ts（interview） | 面接開始 |

---

## 5.2 モーダル

| ファイル | 役割 |
|---------|------|
| quest-create-modal.ts | クエスト作成 |
| quest-edit-modal.ts | クエスト編集 |

---

# 6. コマンド権限体系

| コマンド | 権限 |
|---------|------|
| /setup | ManageChannels |
| /register | Administrator |
| /quest-create | 全員 |
| /ranking | 全員 |
| /ranking-weekly | 全員 |
| /ranking-init | 管理者 |
| /interview-close | 管理者 |

---

# 7. 今後の拡張予定（任意）

- /quest-list の追加  
- /quest-search の追加  
- /admin add/remove の追加  
- /rankingMonthly の追加  
- 面接ステータス管理（pending / passed / failed）  


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

message_id 対応により、クエスト embed は “スレッド内の特定メッセージ” として管理される。
編集・完了・終了時は message_id を使って embed を直接更新する。

---

## 1.1 クエスト作成 Embed（quest-embed.ts）

目的  
- クエストの概要を視覚的に表示する  
- Forum スレッドのトップメッセージとして使用  
- このメッセージの message_id を DB に保存し、後続操作の唯一の参照元とする  

表示項目  
- タイトル（クエスト名）  
- 説明（description）  
- ポイント（points）  
- 種類（type: single / loop）  
- 発行者（issuer_id）  
- 状態（active / closed）  

デザイン  
- ベージュ系の背景色  
- 太めのタイトル  
- 情報はフィールドで整理  

---

## 1.2 クエスト操作ボタン

完了ボタン（quest-complete-button.ts）  
- ラベル：完了  
- スタイル：Success  
- アクション：ポイント付与、ランキング更新、単発クエストは embed を終了状態に更新  

クローズボタン（quest-close-button.ts）  
- ラベル：終了  
- スタイル：Danger  
- アクション：ポイント付与なしで終了、embed を終了状態に更新  

編集ボタン（quest-edit-button.ts）  
- ラベル：編集  
- スタイル：Primary  
- アクション：編集モーダルを開く  

---

## 1.3 クエスト編集モーダル（quest-edit-modal.ts）

目的  
- active 状態のクエストを編集する  
- 編集後は message_id を使って embed を直接更新する  

入力項目  
- title（text, 必須）  
- description（paragraph, 任意）  
- points（number, 必須）  
- type（text, 必須: single or loop）  

制約  
- closed 状態では開けない  
- 入力値はバリデーションされる  

---

# 2. ランキング UI

ランキングは文明の「努力の可視化」を担う UI。

ランキングは以下の 2 種類のみ。  
- 総合ランキング（Total Ranking）  
- 週間ランキング（Weekly Ranking）  

履歴は保持せず、常に最新状態のみを表示する。

---

## 2.1 総合ランキング Embed（rankingEmbed.ts）

目的  
- 文明の累積ポイントランキングを表示する  

表示項目  
- タイトル：文明ランキング - 合計  
- 本文：1位〜N位のユーザーと累積ポイント  
- 更新時刻  
- 備考：refresh ボタンで再描画可能  

デザイン  
- シンプルで視認性重視  
- 文明の文化色（ベージュ系）  

---

## 2.2 週間ランキング Embed（weeklyReportEmbed.ts）

目的  
- 文明の「今週の流れ」を可視化する  

表示項目  
- タイトル：文明ランキング - 今週  
- 本文：週間ポイント上位者  
- 統計：文明全体の週間作成数・週間完了数  
- 更新時刻  

デザイン  
- 合計ランキングと統一されたレイアウト  
- ボタンなし（週間ランキングは上書きのみ）  

---

## 2.3 ランキング操作ボタン（ranking-refresh-button.ts）

目的  
- 総合ランキングを再描画する唯一のボタン  

ラベル  
- 更新  

スタイル  
- Secondary  

挙動  
- updateRealtimeRanking() を呼び出し、総合ランキングを再描画  

---

# 3. 面接 UI（Interview）

ギルド参加希望者が面接を開始し、  
応募者と管理者のみが閲覧できる専用チャンネルで面接を行うための UI。

---

## 3.1 面接開始ボタン（start.ts）

設置場所  
- ガイドラインチャンネル（ID: 1121271639565422643）

ラベル  
- ギルド参加希望はこちら

スタイル  
- Primary（青）

挙動  
- 応募者専用の面接チャンネルを作成  
- 応募者＋管理者のみ閲覧可能に権限設定  
- 初期メッセージを送信  
- 応募者へ ephemeral で通知  

---

## 3.2 面接チャンネル初期 Embed（interviewStart.ts）

目的  
- 面接開始の案内  
- 応募者と管理者に必要な情報を提示  

表示項目  
- タイトル：面接チャンネルが作成されました  
- 本文：  
  - 応募者への案内  
  - 管理者への案内（面接完了後は /interview-close を実行）  

デザイン  
- 文明 BOT の文化色（ベージュ系）  
- 情報はフィールドで整理  

---

# 4. 管理者 UI

## 4.1 setup コマンドの返信メッセージ

内容  
- 作成されたカテゴリ名  
- 作成されたチャンネル一覧  
- 文明の開始を知らせるメッセージ  

---

## 4.2 register コマンドの返信

内容  
- 登録されたユーザー名  
- 既に登録済みの場合はエラーメッセージ  

---

# 5. UI の文化的ルール

1. ベージュ系の落ち着いた色を基調とする  
2. 情報はフィールドで整理する  
3. ボタン色の意味を統一する  
   - 緑：完了・承認  
   - 赤：終了・削除  
   - 青：主要操作  
   - グレー：更新  
4. モーダルは最小限の入力で済むようにする  

---

# 6. 今後の拡張（任意）

- クエスト一覧 Embed の追加  
- 月間ランキング Embed の追加  
- 管理者向け UI の統一デザイン化  
- カラーガイドラインの策定  
- 面接評価モーダルの追加  


---
# 06_operation_flow.md

# 06_operation_flow — 運用フロー（最終版）

協力者求むBOT の運用は、
「カテゴリ（文明単位）の作成」から始まり、
「クエストの発行・達成」「ランキング更新」「週次リセット」へと循環する。

本章では、管理者とユーザーがどのように BOT を利用し、
文明がどのように運用されるかをフローとして定義する。

---

# 1. 文明の開始（カテゴリ作成）

文明の運用は、管理者が /setup を実行するところから始まる。

## 1.1 /setup 実行フロー

/setup を実行  
→ カテゴリ作成  
→ チャンネル自動生成  
→ settings に登録  
→ admins に登録

### 自動生成されるチャンネル
- クエスト掲示板（Forum）
- ログチャンネル（Text）
- ランキングチャンネル（Text）

### DB 登録
- settings に category_id とチャンネルIDを保存
- 実行者を admins に登録

---

# 2. クエスト運用フロー

文明の中心となるのが「クエスト（タスク）」の運用。

---

## 2.1 クエスト作成フロー

/quest-create を実行  
→ モーダル入力  
→ Forum スレッド生成  
→ embed 投稿  
→ message_id 保存  
→ quests に INSERT  
→ ランキング更新

### 作成時の処理
- Forum スレッドを作成
- クエスト embed を投稿
- 投稿したメッセージの message_id を quests.message_id に保存
- quests にレコード追加（status = active）
- users.weekly_tasks_created を加算
- user_stats のリアルタイム更新
- ランキングのリアルタイム更新

---

## 2.2 クエスト編集フロー

編集ボタンを押す  
→ 編集モーダル入力  
→ quests UPDATE  
→ message_id を使って embed を直接更新

### 編集可能
- title
- description
- points
- type

### 制約
- closed 状態では編集不可
- embed 更新は message_id を使って行う

---

## 2.3 クエスト完了フロー（active → closed）

完了ボタンを押す  
→ quest_logs に INSERT  
→ users 更新  
→ user_stats 更新  
→ ランキング更新  
→ embed 更新  
→ closed

### 完了時の処理
- quest_logs にログ追加
- users.total_points を加算
- users.weekly_points を加算
- users.weekly_tasks_completed を加算
- user_stats を更新
- ランキング更新
- 単発クエスト（single）は message_id を使って embed を終了状態に更新

---

## 2.4 クエストクローズフロー（active → closed）

終了ボタンを押す  
→ quests.status = closed  
→ embed を終了状態に更新

### 特徴
- ポイント付与なし
- ログ追加なし
- ランキング更新なし
- message_id を使って embed を終了状態に更新

---

# 3. ランキング運用フロー

ランキングは文明の「努力の可視化」を担う。

---

## 3.1 リアルタイムランキング更新（総合）

### トリガー
- クエスト作成
- クエスト完了
- クエスト編集（ポイント変更時）

### 処理
- user_stats.total_point を元にランキングを再計算
- ランキングチャンネルのメッセージを 1件だけ更新
- refresh ボタンを付与

---

## 3.2 週間ランキング更新（履歴なし）

rankingWeekly.ts を実行  
→ weeklyReportEmbed を生成  
→ ランキングチャンネルに上書き投稿

### 内容
- user_stats.weekly_point のランキング
- 文明全体の週間作成数・完了数
- ボタンなし（上書きのみ）

---

## 3.3 初期メッセージ作成（/ranking-init）

### 目的
- ランキングチャンネルを初期化する
- メッセージをすべて削除し、空の状態に戻す

---

## 3.4 累計ポイントワイプフロー（/reset-total-points）
管理者が累計ポイントをリセットするためのフロー。

### 実行フロー
/reset-total-points 実行
→ users.total_points を全ユーザー 0 に更新
→ user_stats.total_point を全ユーザー 0 に更新
→ ランキング（総合）を再描画
→ 成功メッセージを返す（ephemeral）

### 特徴
- 履歴（quest_logs）は削除しない
- weekly_points など週次統計には影響しない
- 文明の「累計ランキング」を新しいシーズンとして再スタートできる

ｰｰｰ

# 4. ユーザー登録フロー

ユーザーは以下のいずれかで登録される。

---

## 4.1 自動登録（推奨）

### トリガー
- クエスト完了
- クエスト作成
- ランキング更新時の参照

### 処理
- users に存在しない場合、自動で INSERT

---

## 4.2 手動登録（/register）

### 目的
- 初期導入時の事前登録
- テスト環境での登録

---

# 5. ログ運用フロー

ログチャンネルには以下が記録される。

### 記録内容
- クエスト作成
- クエスト完了
- クエスト終了
- ランキング更新（必要に応じて）

### 目的
- 文明の活動履歴を残す
- トラブルシューティングに利用

---

# 6. 面接運用フロー（Interview）

ギルド参加希望者の面接を行うためのフロー。

---

## 6.1 面接開始フロー（ボタン）

ガイドラインチャンネルのボタンを押す  
→ 面接カテゴリ内に専用チャンネルを作成  
→ 応募者＋管理者のみ閲覧可能に権限設定  
→ 初期メッセージを送信  
→ 応募者へ ephemeral で通知

### 特徴
- DB を使用しない  
- チャンネルの存在位置（カテゴリ）が状態そのもの  

---

## 6.2 面接終了フロー（/interview-close）

/interview-close を実行  
→ チャンネルのカテゴリを確認  
→ 面接カテゴリでなければエラー  
→ 面接アーカイブカテゴリへ移動  
→ 成功メッセージを返す（ephemeral）

---

# 7. 文明のライフサイクル（全体図）

setup  
→ クエスト作成  
→ クエスト達成・終了  
→ ランキング更新  
→ 週次リセット  
→ 面接（随時）  
→ 繰り返し

文明はこのサイクルを繰り返しながら成長していく。

---

# 8. 今後の拡張（任意）

- 月間ランキングの追加
- クエストのアーカイブ機能
- 管理者向けダッシュボード
- 自動リセットのスケジューラ化
- 面接ステータス管理


---
# 07_error_handling.md

# 07_error_handling — エラー処理仕様（最終版）

協力者求むBOT のエラー処理は  
**「ユーザーに優しく、開発者に厳しく」** を原則として設計されている。

- ユーザーには簡潔で安全なメッセージを返す  
- 開発者には詳細なログを残す  
- BOT が沈黙しないように必ず返信する  

---

# 1. 基本方針

## 1.1 BOT は必ず返信する
Discord の仕様上、3 秒以内に返信または defer しないと UI エラーが発生する。

すべてのコマンド・ボタン・モーダルは以下を満たす：

- try/catch で囲む  
- catch 内で必ず reply または editReply  
- interaction.replied / deferred を確認し二重返信を防ぐ  

---

## 1.2 ユーザーには安全なメッセージを返す
ユーザー向けエラーメッセージは以下に統一する：

> 「エラーが発生しました。もう一度お試しください。」

機能固有の説明が必要な場合のみ、短く補足する。

---

## 1.3 開発者には詳細ログを出す
catch 内では必ず console.error を実行する。

ログには以下を含める：

- 機能名  
- error.message  
- error.stack  
- interaction 情報（user.id / commandName / customId / channelId など）  

---

## 1.4 DB エラーは必ずログに残す
すべての DB 操作（INSERT / UPDATE / SELECT / DELETE）は try/catch 内で実行する。

---

# 2. コマンドのエラー処理

## 2.1 スラッシュコマンド（/setup, /register, /ranking など）
原則：

- ハンドラ全体を try/catch  
- catch 内で必ず interaction.reply（ephemeral）  
- ログに機能名・ユーザー ID・エラー内容を含める  

---

# 3. モーダルのエラー処理

モーダルは入力値や DB 書き込みで失敗しやすい。

原則：

- try/catch  
- interaction.replied / deferred を確認して二重返信を防ぐ  
- 入力値は可能な範囲でログに残す  

---

# 4. ボタンのエラー処理

ボタンは押された瞬間に処理が走るため、エラー発生率が高い。

原則：

- try/catch  
- 返信は ephemeral  
- DB 書き込みやメッセージ更新失敗は必ずログ  

---

## 4.1 ランキング更新ボタンのエラー

### よくあるエラー
- user_stats の取得失敗  
- ランキングメッセージ更新失敗  

### ユーザー向けメッセージ
> 「ランキングの更新中にエラーが発生しました。」

### ログ
- 機能名: ranking_update_button  
- error  
- interaction.user.id  
- message_id / channelId  

---

# 5. message_id 対応に伴う新しいエラーパターン

## 5.1 message_id が NULL の場合
**症状**  
- embed 更新ができない

**対処**  
- ユーザー: 「クエストメッセージの情報が不足しているため、更新できません。」  
- ログ: 「message_id 未設定」  

---

## 5.2 ThreadChannel の取得失敗
**症状**  
- threadId が不正  
- スレッドが削除されている  

**対処**  
- ユーザー: 「スレッドが見つかりません。」  
- ログ: threadId / channelId  

---

## 5.3 message fetch 失敗
**症状**  
- メッセージが削除されている  
- BOT が権限不足  

**対処**  
- ユーザー: 「クエストメッセージが見つかりません。」  
- ログ: message_id / threadId / channelId  

---

## 5.4 embed 更新失敗
**症状**  
- botMessage.edit() が例外  

**対処**  
- ユーザー: 「メッセージの更新中にエラーが発生しました。」  
- ログ: error / message_id / embed 内容（可能な範囲で）  

---

## 5.5 スレッドロック・アーカイブ失敗
**症状**  
- setLocked / setArchived が例外  

**対処**  
- ユーザー: 影響なし（成功扱い）  
- ログ: error / threadId  

---

# 6. 面接機能（Interview）のエラー処理

## 6.1 面接開始ボタン（start.ts）

### 想定されるエラー
- 面接カテゴリが存在しない  
- チャンネル作成失敗  
- 権限設定失敗  

### ユーザー向けメッセージ
> 「面接チャンネルの作成中にエラーが発生しました。」

### ログ
- error  
- interaction.user.id  
- parentId  

---

## 6.2 /interview-close

### 想定されるエラー
- 面接カテゴリ以外で実行  
- アーカイブカテゴリへの移動失敗  
- 権限不足  

### ユーザー向けメッセージ
- 「このチャンネルは面接チャンネルではありません。」  
- または通常の簡潔エラー  

### ログ
- error  
- channel.id  
- parentId  

---

# 7. よくあるエラーと対処方針

## 7.1 DB 接続エラー
**症状**  
- すべてのコマンドが失敗  

**対処**  
- db/client.ts の設定確認  
- Discloud の DB 状態確認  

---

## 7.2 カテゴリ外での操作
**症状**  
- 「カテゴリ内で実行してください」  

**原因**  
- getCategoryId() が null  

**対処**  
- settings の category_id を確認  
- チャンネル構造を確認  

---

## 7.3 モーダルの入力値エラー
**症状**  
- points が数値でない  
- type が不正  

**対処**  
- バリデーション追加  
- 入力エラーを返す  

---

## 7.4 ランキング更新エラー
**症状**  
- ランキングが更新されない  

**原因**  
- user_stats の整合性が崩れている  

**対処**  
- user_stats を再計算  
- quest_logs の整合性確認  

---

# 8. /reset-total-points のエラー処理（新規）

累計ポイントワイプ機能に特有のエラーを定義する。

## 8.1 想定されるエラー
- users.total_points の一括更新失敗  
- user_stats.total_point の一括更新失敗  
- ランキング再描画（updateRealtimeRanking）が例外  
- DB トランザクション失敗（必要な場合）  

## 8.2 ユーザー向けメッセージ
> 「累計ポイントのリセット中にエラーが発生しました。」

## 8.3 ログ内容
- 機能名: reset-total-points  
- error.message  
- error.stack  
- 実行ユーザー ID  
- 更新対象ユーザー数（可能なら）  

## 8.4 特記事項
- quest_logs は削除しないため、ログ整合性は維持される  
- user_stats と users の両方を更新する必要がある  
- 片方だけ成功した場合は **必ずログに残す**（整合性崩壊防止）  

---

# 9. エラー発生時のログフォーマット

```text
[ERROR] 機能名 日時
内容: error.message
Stack: error.stack
Context: { userId, channelId, guildId, ... }

ｰｰｰ

# 10. Discord 側の UI エラー（「問題が発生しました」）の回避

- 3 秒以内に reply または defer
- 長時間処理は deferReply → editReply
- モーダルは defer を検討

---

# 11.今後の拡張

- ログチャンネルへの自動エラー通知
- エラーコード体系の導入
- Sentryなどの外部ログサービス導入


