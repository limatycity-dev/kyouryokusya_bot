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