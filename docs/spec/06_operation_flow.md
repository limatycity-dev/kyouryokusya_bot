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

`/setup` 実行  
→ カテゴリ作成  
→ チャンネル自動生成  
→ settings に登録  
→ admins に登録  

### 自動生成されるチャンネル
- クエスト掲示板（Forum）
- ログチャンネル（Text）
- ランキングチャンネル（Text）

### DB 登録
- settings に category_id と各チャンネルIDを保存
- 実行者を admins に登録

---

# 2. クエスト運用フロー

文明の中心となるのが「クエスト（タスク）」の運用。

---

## 2.1 クエスト作成フロー

`/quest-create` 実行  
→ モーダル入力  
→ Forum スレッド生成  
→ クエスト embed 投稿  
→ message_id 保存  
→ quests に INSERT  

### 作成時の処理
- Forum スレッドを作成  
- クエスト embed を投稿  
- 投稿したメッセージの message_id を `quests.message_id` に保存  
- quests にレコード追加（status = active）  
- users.weekly_tasks_created を加算  
- users に存在しない場合は自動登録  

※ クエスト作成時点ではランキングは更新されない（完了時のみ）。

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

### 編集不可（実装準拠）
- type  
- status  
- category_id  
- issuer_id  
- forum_thread_id  
- message_id  

### 制約
- **active / closed どちらも編集可能（実装仕様）**
- embed 更新は message_id を使って行う

---

## 2.3 クエスト完了フロー（active → closed）

完了ボタンを押す  
→ quest_logs に INSERT  
→ user_stats 更新  
→ users.weekly_tasks_completed 更新  
→ ランキング更新  
→ embed 更新  
→ （single の場合）closed へ遷移  

### 完了時の処理
- quest_logs にログ追加  
- user_stats.total_point / weekly_point を加算  
- users.weekly_tasks_completed を加算  
- users に存在しない場合は自動登録  
- ランキング（複合ランキング）を更新  
- single の場合：
  - quests.status = closed  
  - スレッド名を `✅ タイトル` に変更  
  - スレッドをロック & アーカイブ  
  - message_id を使って embed を終了状態に更新  

---

## 2.4 クエストクローズフロー（active → closed）

終了ボタンを押す  
→ quests.status = closed  
→ スレッドロック & アーカイブ  
→ embed を終了状態に更新  

### 特徴
- quest_logs 追加なし  
- ポイント付与なし  
- user_stats / ランキング更新なし  
- message_id を使って embed を終了状態に更新  

---

# 3. ランキング運用フロー

ランキングは文明の「努力の可視化」を担う。  
表示は常に **複合ランキング（総合＋週間＋週間サマリー）** として 1 メッセージに統合される。

---

## 3.1 ランキング更新フロー（複合ランキング）

### トリガー
- クエスト完了（single / loop 共通）  
- `/ranking` 実行  
- `/ranking-weekly` 実行  
- ランキング更新ボタン（refresh）押下  

### 処理
- user_stats を参照して総合・週間ランキングを再計算  
- users の weekly_tasks_* を参照して週間サマリーを生成  
- ランキングチャンネル内のメッセージを **全削除**  
- 複合ランキング embed を 1 件だけ再投稿  

---

## 3.2 週次リセットフロー

週次リセットは rankingService.ensureWeeklyResetIfNeeded() により自動判定される。

### 処理内容
- users.weekly_tasks_created = 0  
- users.weekly_tasks_completed = 0  
- user_stats.weekly_point = 0  
- system.weekly_reset_key を更新  

※ `/ranking-weekly` 実行時などに内部的に呼び出される。

---

## 3.3 初期メッセージ作成フロー（/ranking-init）

### 目的
- ランキングチャンネルを初期化する  
- 既存メッセージをすべて削除し、複合ランキングメッセージを 1 件だけ作成する  

---

# 4. ユーザー登録フロー

ユーザーは以下のいずれかで登録される。

---

## 4.1 自動登録（標準）

### トリガー
- クエスト完了  
- クエスト作成  
- ランキング更新時の参照（必要に応じて）  

### 処理
- users に user_id が存在しない場合、自動で INSERT  

---

## 4.2 手動登録（/register, deprecated）

### 目的
- 開発初期の手動登録用（現在は非推奨）  

※ 現行フロー（interview → profile → quests）では使用しない。

---

# 5. ログ運用フロー

ログチャンネルには以下が記録される。

### 記録内容
- クエスト作成  
- クエスト完了  
- クエスト終了  

### 目的
- 文明の活動履歴を残す  
- トラブルシューティングに利用  

※ ランキング更新自体はログに残さない（仕様上）。

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

`/interview-close` 実行  
→ チャンネルの親カテゴリを確認  
→ 面接カテゴリでなければエラー  
→ 面接アーカイブカテゴリへ移動  
→ 成功メッセージを返す（ephemeral）  

※ 応募者はアーカイブ後もチャンネルを閲覧可能（権限は変更しない）。

---

# 7. 文明のライフサイクル（全体図）

- `/setup`  
  → 文明カテゴリとチャンネル群を作成  
- クエスト作成  
  → 文明内の挑戦を定義  
- クエスト達成・終了  
  → 文明の活動が記録される  
- ランキング更新  
  → 努力が可視化される  
- 週次リセット  
  → 文明の「今週の動き」がリフレッシュされる  
- 面接（随時）  
  → 文明に新しいメンバーが参加する  

文明はこのサイクルを繰り返しながら成長していく。

---

# 8. 今後の拡張（任意）

- 月間ランキングの追加  
- クエストのアーカイブ機能  
- 管理者向けダッシュボード  
- 自動リセットのスケジューラ化  
- 面接ステータス管理  
- 累計ポイントワイプ機能（/reset-total-points）の正式実装  
```