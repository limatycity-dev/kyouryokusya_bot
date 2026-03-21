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