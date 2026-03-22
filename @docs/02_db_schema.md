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