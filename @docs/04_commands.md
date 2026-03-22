
```md
# 04_commands — コマンド仕様（最終版）

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
- **クエスト embed の message_id を保存（安定版の中核）**

### ■ 引数
| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| title | string | Yes | クエスト名 |
| points | number | Yes | ポイント |
| type | string | Yes | 'single' or 'loop' |
| description | string | No | 説明文 |

### ■ 実行結果
- Forum スレッド作成  
- quests に INSERT  
- **BOT が投稿したクエスト embed の message_id を保存**  
- users.weekly_tasks_created を加算  
- user_stats のリアルタイム更新  
- ランキング更新  

---

## 2.2 クエスト編集（ボタン＋モーダル）

@@@
quest-edit-button → quest-edit-modal → quest-edit-modal.ts
@@@

### ■ 目的
- active 状態のクエストを編集する  

### ■ 編集可能項目
- title  
- description  
- points  
- type  

### ■ 実行結果
- quests を UPDATE  
- **message_id を使用して embed を直接更新（スレッド内検索は行わない）**

---

## 2.3 クエスト完了（ボタン）

@@@
quest-complete-button.ts
@@@

### ■ 目的
- クエストを完了し、ポイントを付与する  

### ■ 実行結果
- quest_logs に INSERT  
- users.total_points を加算  
- users.weekly_points を加算  
- users.weekly_tasks_completed を加算  
- user_stats（total_point / weekly_point）を更新  
- ランキング更新  
- status = "closed"  
- **単発クエスト（single）は message_id を使って embed を終了状態に更新**

---

## 2.4 クエストクローズ（ボタン）

@@@
quest-close-button.ts
@@@

### ■ 目的
- クエストをポイント付与なしで終了する  

### ■ 実行結果
- quests.status = "closed"  
- ログ追加なし  
- ランキング更新なし  
- **message_id を使って embed を終了状態に更新**

---

# 3. ランキングコマンド（/ranking）

文明の「努力の見える化」を担当するコマンド群。

ランキングは専用チャンネル（`settings.ranking_channel_id`）に集約し、  
以下の運用方針を採用する。

- **総合ランキング（リアルタイム）**  
  - チャンネル内に常に 1 メッセージのみ  
  - クエスト完了時に自動更新  
  - refresh ボタンあり  

- **週間ランキング（履歴なし）**  
  - チャンネル内に常に 1 メッセージのみ  
  - 週切り替え時に上書き更新  
  - ボタンなし  

---

## 3.1 /ranking  
**総合ポイントランキングを表示する。**

### ■ 挙動
- ランキングチャンネルを取得  
- チャンネル内のメッセージをすべて削除  
- `updateRealtimeRanking()` を呼び出し、最新ランキングを投稿  
- ボタンは **refresh のみ**  

---

## 3.2 /ranking-weekly  
**週間ランキングを表示する。**

### ■ 挙動
- ランキングチャンネルを取得  
- チャンネル内のメッセージをすべて削除  
- `updateWeeklyRanking()` を呼び出し、最新週間ランキングを投稿  
- **ボタンなし**  

---

## 3.3 /ranking-init  
**ランキングチャンネルを初期化する。**

### ■ 挙動
- ランキングチャンネルを取得  
- メッセージをすべて削除  
- 「ランキングチャンネルを初期化しました」を返す  

---

# 4. UI コンポーネント一覧

## 4.1 ボタン

| ファイル | 役割 |
|----------|------|
| quest-complete-button.ts | クエスト完了 |
| quest-close-button.ts | クエスト終了 |
| quest-edit-button.ts | 編集モーダルを開く |
| ranking-refresh-button.ts | ランキング再描画（唯一のランキングボタン） |

---

## 4.2 モーダル

| ファイル | 役割 |
|----------|------|
| quest-create-modal.ts | クエスト作成 |
| quest-edit-modal.ts | クエスト編集 |

---

# 5. コマンド権限体系

| コマンド | 権限 |
|----------|------|
| /setup | ManageChannels |
| /register | Administrator |
| /quest-create | 全員 |
| /ranking | 全員 |
| /ranking-weekly | 全員 |
| /ranking-init | 管理者（実装依存） |

---

# 6. 今後の拡張予定（任意）

- /quest-list の追加  
- /quest-search の追加  
- /admin add/remove の追加  
- /rankingMonthly の追加  
```
