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
