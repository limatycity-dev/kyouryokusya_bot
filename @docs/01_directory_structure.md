
```md
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
**message_id 対応により、クエスト embed のメッセージを直接参照する安定版構造になった。**

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

### ■ 役割
- クエスト作成  
  - スレッド作成  
  - embed 投稿  
  - **message_id を DB に保存（安定版の中核）**
- 編集  
  - DB の message_id を使って embed を直接編集  
- 完了  
  - ポイント付与  
  - 単発クエストは message_id を使って終了状態に更新  
- クローズ  
  - message_id を使って embed を終了状態に更新  
- Embed 生成  
- モーダル処理  

**Discord フォーラムスレッドのシステムメッセージ混在問題を回避するため、  
スレッド内のメッセージ検索は行わず、message_id を唯一の参照元とする。**

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
  └── 07_error_handling.md
```

---

## /@docs/spec
- 統合仕様書（spec_full.md）の出力先  
- Githubにて管理し、毎回 RAW URL で共有する

---

## プロジェクトルート
- build_spec.js（仕様書統合スクリプト）  
- package.json
```
