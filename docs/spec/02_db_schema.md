```md
# 02_db_schema — データベース構造（現行実装準拠・懸念点含む最終版）

文明BOT のデータベースは、  
**「カテゴリ（文明単位）を中心とした活動管理」** を軸に設計されている。

以下は **現行実装と完全一致したスキーマ** に、  
**未使用カラムなどの懸念点も正式に記載した最新版**。

---

# 1. settings — 文明カテゴリ（文明の本体）

```sql
CREATE TABLE IF NOT EXISTS settings (
  category_id TEXT PRIMARY KEY,
  quest_board_channel_id TEXT NOT NULL,
  log_channel_id TEXT NOT NULL,
  ranking_channel_id TEXT NOT NULL
);
```

### ■ 役割
- 文明カテゴリの主キー  
- クエスト掲示板・ログ・ランキングのチャンネルIDを保持  
- `/setup` により自動生成される  

---

# 2. quests — クエスト（タスク）

```sql
CREATE TABLE IF NOT EXISTS quests (
  id SERIAL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES settings(category_id),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,          -- 'single' or 'loop'
  status TEXT NOT NULL,        -- 'active' or 'closed'
  forum_thread_id TEXT NOT NULL,
  issuer_id TEXT NOT NULL,     -- 発行者（Discord user ID）
  message_id TEXT,             -- クエスト embed のメッセージID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ■ 役割
- クエストの基本情報  
- Discord フォーラムスレッドとの紐づけ  
- message_id により embed を安定更新  

---

# 3. users — ユーザー情報（累積ポイント＋週間統計）

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  weekly_tasks_created INTEGER DEFAULT 0,
  weekly_tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ■ 役割
- 累積ポイント（※現行実装では未使用）  
- 週間ポイント（※同上）  
- 週間タスク数（ランキングサマリー用）  

### ⚠️ 懸念点（実装上の問題）
- `total_points` / `weekly_points` は **実装で一切参照されていない**  
- ランキングは **user_stats** を参照するため、これらは未使用カラム  
- 将来的に削除または user_stats と統合する可能性あり  

---

# 4. quest_logs — クエスト達成ログ

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

---

# 5. admins — カテゴリ管理者

```sql
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES settings(category_id),
  user_id TEXT NOT NULL
);
```

### ■ 役割
- 文明カテゴリごとの管理者  
- `/setup` 実行者が初代管理者として登録  

---

# 6. system — グローバル設定

```sql
CREATE TABLE IF NOT EXISTS system (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ■ 役割
- BOT 全体の設定値  
- 週次リセットのキーなど  

---

# 7. user_stats — ランキング高速化キャッシュ

```sql
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  total_point INTEGER DEFAULT 0,
  weekly_point INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, category_id)
);
```

### ■ 役割
- ランキング表示の高速化  
- クエスト完了時にリアルタイム更新  
- weekly_point は週次リセット対象  

### ⚠️ 懸念点
- `total_point` は **キャッシュであり正規データではない**  
- users.total_points との整合性は実装上存在しない  
- 将来的に「正規データの一本化」が必要になる可能性あり  

---

# 8. テーブル関係図（概念）

```
settings (category)
   │
   ├───< quests
   │        │
   │        └───< quest_logs >─── users
   │
   ├───< admins
   │
   └───< user_stats
```

---

# 9. 既知の懸念点（総まとめ）

- users.total_points / weekly_points は **未使用カラム**  
- user_stats.total_point と users.total_points の整合性がない  
- ランキングは user_stats のみ参照  
- 将来的にポイント管理の正規化が必要  

---

# 10. 今後の拡張予定（任意）

- 月次ランキング（monthly）  
- user_stats の自動再計算ジョブ  
- users テーブルのポイントカラム整理  
- system のキー体系の整理  
```