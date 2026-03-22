```md
# 06_operation_flow — 運用フロー（最終版）

協力者求むBOT の運用は、  
「カテゴリ（文明単位）の作成」から始まり、  
「クエストの発行・達成」「ランキング更新」「週次リセット」へと循環する。

本章では、管理者とユーザーがどのように BOT を利用し、  
文明がどのように運用されるかをフローとして定義する。

---

# 1. 文明の開始（カテゴリ作成）

文明の運用は、管理者が `/setup` を実行するところから始まる。

## 1.1 /setup 実行フロー

@@@
/setup → カテゴリ作成 → チャンネル自動生成 → settings INSERT → admins INSERT
@@@

### ■ 自動生成されるチャンネル
- クエスト掲示板（Forum）
- ログチャンネル（Text）
- ランキングチャンネル（Text）

### ■ DB 登録
- settings に category_id とチャンネルIDを保存  
- 実行者を admins に登録  

---

# 2. クエスト運用フロー

文明の中心となるのが「クエスト（タスク）」の運用。

---

## 2.1 クエスト作成フロー

@@@
/quest-create → モーダル入力 → Forum スレッド生成 → quests INSERT → ランキング更新
@@@

### ■ 作成時の処理
- Forum スレッドを作成  
- quests にレコード追加（status = active）  
- users.weekly_tasks_created を加算  
- user_stats のリアルタイム更新  
- ランキングのリアルタイム更新  

---

## 2.2 クエスト編集フロー

@@@
編集ボタン → 編集モーダル → quests UPDATE
@@@

### ■ 編集可能
- title  
- description  
- points  
- type  

### ■ 制約
- closed 状態では編集不可  

---

## 2.3 クエスト完了フロー（active → closed）

@@@
完了ボタン → quest_logs INSERT → users UPDATE → user_stats UPDATE → ランキング更新 → closed
@@@

### ■ 完了時の処理
- quest_logs にログ追加  
- users.total_points を加算  
- users.weekly_points を加算  
- users.weekly_tasks_completed を加算  
- user_stats（total_point / weekly_point）を更新  
- ランキング更新  

---

## 2.4 クエストクローズフロー（active → closed）

@@@
終了ボタン → quests.status = closed
@@@

### ■ 特徴
- ポイント付与なし  
- ログ追加なし  
- ランキング更新なし  

---

# 3. ランキング運用フロー

ランキングは文明の「努力の可視化」を担う。

---

## 3.1 リアルタイムランキング更新（総合）

### ■ トリガー
- クエスト作成  
- クエスト完了  
- クエスト編集（ポイント変更時）  

### ■ 処理
- user_stats.total_point を元にランキングを再計算  
- ランキングチャンネルのメッセージを **1件だけ更新**  
- refresh ボタンを付与  

---

## 3.2 週間ランキング更新（履歴なし）

@@@
rankingWeekly.ts → weeklyReportEmbed → ランキングチャンネルに上書き投稿
@@@

### ■ 内容
- user_stats.weekly_point のランキング  
- 文明全体の週間作成数・完了数  
- ボタンなし（上書きのみ）  

---

## 3.3 初期メッセージ作成（/ranking-init）

### ■ 目的
- ランキングチャンネルを初期化する  
- メッセージをすべて削除し、空の状態に戻す  

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

週間ランキングのため、  
毎週特定のタイミングで weekly_* をリセットする。

### ■ 対象
- users.weekly_points  
- users.weekly_tasks_created  
- users.weekly_tasks_completed  
- user_stats.weekly_point  

### ■ 実装
- system テーブルに最終リセット時刻を保存  
- rankingWeekly 実行時に必要ならリセット  
- リセット後に週間ランキングを上書き投稿  

---

# 7. 文明のライフサイクル（全体図）

@@@
setup
  ↓
クエスト作成
  ↓
クエスト達成・終了
  ↓
ランキング更新
  ↓
週次リセット（weekly）
  ↓
（繰り返し）
@@@

文明はこのサイクルを繰り返しながら成長していく。

---

# 8. 今後の拡張（任意）

- 月間ランキングの追加  
- クエストのアーカイブ機能  
- 管理者向けダッシュボード  
- 自動リセットのスケジューラ化  
```