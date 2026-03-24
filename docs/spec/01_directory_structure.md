01_directory_structure — ディレクトリ構造
文明BOTのディレクトリ構造は
「Feature（機能）単位での独立性」 と
「長期運用に耐える拡張性」 を最優先に設計されている。
本章では、実際の src 構造に基づき、
各レイヤーの役割と責務を明確に定義する。

1. /src — 文明BOTのアプリケーション本体
📦src
┣ 📂bot
┣ 📂db
┣ 📂features
┣ 📂types
┗ 📂utils

1-1. /src/bot — BOT 起動レイヤー
📂bot
┣ 📜client.ts
┗ 📜index.ts
役割
- Discord クライアントの初期化
- イベントハンドラの登録
- interactionCreate のルーティング
- BOT のエントリーポイント

1-2. /src/db — データアクセスレイヤー
📂db
┣ 📜client.ts
┣ 📜settingsStore.ts
┗ 📜test.ts
役割
- PostgreSQL クライアントの初期化
- クエリ実行ユーティリティ
- settings の取得・保存
- DB 動作確認用スクリプト

1-3. /src/features — 文明の「棚」（Feature）群
📂features
┣ 📂admin
┣ 📂interview
┣ 📂profile
┣ 📂quests
┣ 📂ranking
┗ 📜getUser.ts
特徴
- 文明BOTの中心
- 各 Feature が UI / DB / Commands / Services を持つ
- 完全に独立して改善可能

2. Feature 詳細構造

2-1. /src/features/admin — 管理者機能
📂admin
┣ 📂commands
┃　┣ 📜register.ts
┃　┗ 📜setup.ts
┗ 📜admin.ts
役割
- 文明の初期セットアップ
- ユーザー手動登録
- 管理者向け共通処理

2-2. /src/features/interview — 面接機能
📂interview
┣ 📂buttons
┃　┗ 📜start.ts
┣ 📂commands
┃　┗ 📜close.ts
┣ 📂config
┃　┗ 📜constants.ts
┣ 📂embeds
┃　┗ 📜interviewStart.ts
┣ 📂services
┃　┗ 📜createInterviewChannel.ts
┗ 📂utils
┗ 📜validateInterviewChannel.ts
役割
- 面接開始ボタン → 専用チャンネル生成
- 応募者＋管理者のみ閲覧可能に権限設定
- 初期メッセージ送信
- /interview-close → アーカイブへ移動
- 面接カテゴリ判定
- DB を使わない「チャンネル位置＝状態」設計

2-3. /src/features/profile — プロフィール機能
📂profile
┗ 📂commands
┗ 📜profileSetup.ts
役割
- 文明メンバーのプロフィール設定
- 今後の文化的プロフィール拡張の基盤

2-4. /src/features/quests — クエスト管理機能
📂quests
┣ 📜quest-close-button.ts
┣ 📜quest-complete-button.ts
┣ 📜quest-create-modal.ts
┣ 📜quest-create.ts
┣ 📜quest-edit-button.ts
┣ 📜quest-edit-modal.ts
┗ 📜quest-embed.ts
役割
- クエスト作成（スレッド生成＋embed 投稿）
- message_id を唯一の参照元として DB に保存
- 編集・完了・クローズの安定処理
- フォーラムのシステムメッセージ混在問題を回避
- Embed 生成とモーダル処理

2-5. /src/features/ranking — ランキング・週次レポート機能
📂ranking
┣ 📂commands
┃　┣ 📜ranking.ts
┃　┣ 📜rankingInit.ts
┃　┗ 📜rankingWeekly.ts
┣ 📂repository
┃　┣ 📜rankingRepository.ts
┃　┗ 📜settingRepository.ts
┣ 📂services
┃　┣ 📜rankingService.ts
┃　┗ 📜weeklyReportService.ts
┣ 📂ui
┃　┣ 📜createCombinedRankingEmbed.ts
┃　┣ 📜rankingEmbed.ts
┃　┣ 📜rankingRedreshButton.ts
┃　┗ 📜weeklyRankingEmbed.ts
┗ 📂utils
┣ 📜dataUtils.ts
┗ 📜rankingUtils.ts
役割
- ランキング計算
- ランキング表示（Embed）
- 週次レポート生成
- 初期メッセージ作成
- ランキング更新処理
- repository による DB 抽象化
- UI（Embed / ボタン）生成

3. /src/types — 型定義レイヤー
📂types
┗ 📜user.ts

4. /src/utils — 汎用ユーティリティ
📂utils
┗ 📜getCategoryId.ts

5. /sql — データベース定義
- schema.sql
- 初期化用 SQL
- マイグレーション用 SQL

6. /@docs — 分割仕様書
📂@docs
┣ 00_overview.md
┣ 01_directory_structure.md
┣ 02_db_schema.md
┣ 03_state_machine.md
┣ 04_commands.md
┣ 05_ui_spec.md
┣ 06_operation_flow.md
┗ 07_error_handling.md

7. /@docs/spec — 統合仕様書出力先
- spec_full.md（生成物）

8. プロジェクトルート
- build_spec.js
- package.json
