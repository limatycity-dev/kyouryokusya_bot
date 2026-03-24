# 07_error_handling — エラー処理仕様（最終版）

協力者求むBOT のエラー処理は  
**「ユーザーに優しく、開発者に厳しく」** を原則として設計されている。

- ユーザーには簡潔で安全なメッセージを返す  
- 開発者には詳細なログを残す  
- BOT が沈黙しないように必ず返信する  

---

# 1. 基本方針

## 1.1 BOT は必ず返信する
Discord の仕様上、3 秒以内に返信または defer しないと UI エラーが発生する。

すべてのコマンド・ボタン・モーダルは以下を満たす：

- try/catch で囲む  
- catch 内で必ず reply または editReply  
- interaction.replied / deferred を確認し二重返信を防ぐ  

---

## 1.2 ユーザーには安全なメッセージを返す
ユーザー向けエラーメッセージは以下に統一する：

> 「エラーが発生しました。もう一度お試しください。」

機能固有の説明が必要な場合のみ、短く補足する。

---

## 1.3 開発者には詳細ログを出す
catch 内では必ず console.error を実行する。

ログには以下を含める：

- 機能名  
- error.message  
- error.stack  
- interaction 情報（user.id / commandName / customId / channelId など）  

---

## 1.4 DB エラーは必ずログに残す
すべての DB 操作（INSERT / UPDATE / SELECT / DELETE）は try/catch 内で実行する。

---

# 2. コマンドのエラー処理

## 2.1 スラッシュコマンド（/setup, /register, /ranking など）
原則：

- ハンドラ全体を try/catch  
- catch 内で必ず interaction.reply（ephemeral）  
- ログに機能名・ユーザー ID・エラー内容を含める  

---

# 3. モーダルのエラー処理

モーダルは入力値や DB 書き込みで失敗しやすい。

原則：

- try/catch  
- interaction.replied / deferred を確認して二重返信を防ぐ  
- 入力値は可能な範囲でログに残す  

---

# 4. ボタンのエラー処理

ボタンは押された瞬間に処理が走るため、エラー発生率が高い。

原則：

- try/catch  
- 返信は ephemeral  
- DB 書き込みやメッセージ更新失敗は必ずログ  

---

## 4.1 ランキング更新ボタンのエラー

### よくあるエラー
- user_stats の取得失敗  
- ランキングメッセージ更新失敗  

### ユーザー向けメッセージ
> 「ランキングの更新中にエラーが発生しました。」

### ログ
- 機能名: ranking_update_button  
- error  
- interaction.user.id  
- message_id / channelId  

---

# 5. message_id 対応に伴う新しいエラーパターン

## 5.1 message_id が NULL の場合
**症状**  
- embed 更新ができない

**対処**  
- ユーザー: 「クエストメッセージの情報が不足しているため、更新できません。」  
- ログ: 「message_id 未設定」  

---

## 5.2 ThreadChannel の取得失敗
**症状**  
- threadId が不正  
- スレッドが削除されている  

**対処**  
- ユーザー: 「スレッドが見つかりません。」  
- ログ: threadId / channelId  

---

## 5.3 message fetch 失敗
**症状**  
- メッセージが削除されている  
- BOT が権限不足  

**対処**  
- ユーザー: 「クエストメッセージが見つかりません。」  
- ログ: message_id / threadId / channelId  

---

## 5.4 embed 更新失敗
**症状**  
- botMessage.edit() が例外  

**対処**  
- ユーザー: 「メッセージの更新中にエラーが発生しました。」  
- ログ: error / message_id / embed 内容（可能な範囲で）  

---

## 5.5 スレッドロック・アーカイブ失敗
**症状**  
- setLocked / setArchived が例外  

**対処**  
- ユーザー: 影響なし（成功扱い）  
- ログ: error / threadId  

---

# 6. 面接機能（Interview）のエラー処理

## 6.1 面接開始ボタン（start.ts）

### 想定されるエラー
- 面接カテゴリが存在しない  
- チャンネル作成失敗  
- 権限設定失敗  

### ユーザー向けメッセージ
> 「面接チャンネルの作成中にエラーが発生しました。」

### ログ
- error  
- interaction.user.id  
- parentId  

---

## 6.2 /interview-close

### 想定されるエラー
- 面接カテゴリ以外で実行  
- アーカイブカテゴリへの移動失敗  
- 権限不足  

### ユーザー向けメッセージ
- 「このチャンネルは面接チャンネルではありません。」  
- または通常の簡潔エラー  

### ログ
- error  
- channel.id  
- parentId  

---

# 7. よくあるエラーと対処方針

## 7.1 DB 接続エラー
**症状**  
- すべてのコマンドが失敗  

**対処**  
- db/client.ts の設定確認  
- Discloud の DB 状態確認  

---

## 7.2 カテゴリ外での操作
**症状**  
- 「カテゴリ内で実行してください」  

**原因**  
- getCategoryId() が null  

**対処**  
- settings の category_id を確認  
- チャンネル構造を確認  

---

## 7.3 モーダルの入力値エラー
**症状**  
- points が数値でない  
- type が不正  

**対処**  
- バリデーション追加  
- 入力エラーを返す  

---

## 7.4 ランキング更新エラー
**症状**  
- ランキングが更新されない  

**原因**  
- user_stats の整合性が崩れている  

**対処**  
- user_stats を再計算  
- quest_logs の整合性確認  

---

# 8. /reset-total-points のエラー処理（新規）

累計ポイントワイプ機能に特有のエラーを定義する。

## 8.1 想定されるエラー
- users.total_points の一括更新失敗  
- user_stats.total_point の一括更新失敗  
- ランキング再描画（updateRealtimeRanking）が例外  
- DB トランザクション失敗（必要な場合）  

## 8.2 ユーザー向けメッセージ
> 「累計ポイントのリセット中にエラーが発生しました。」

## 8.3 ログ内容
- 機能名: reset-total-points  
- error.message  
- error.stack  
- 実行ユーザー ID  
- 更新対象ユーザー数（可能なら）  

## 8.4 特記事項
- quest_logs は削除しないため、ログ整合性は維持される  
- user_stats と users の両方を更新する必要がある  
- 片方だけ成功した場合は **必ずログに残す**（整合性崩壊防止）  

---

# 9. エラー発生時のログフォーマット

```text
[ERROR] 機能名 日時
内容: error.message
Stack: error.stack
Context: { userId, channelId, guildId, ... }

ｰｰｰ

# 10. Discord 側の UI エラー（「問題が発生しました」）の回避

- 3 秒以内に reply または defer
- 長時間処理は deferReply → editReply
- モーダルは defer を検討

---

# 11.今後の拡張

- ログチャンネルへの自動エラー通知
- エラーコード体系の導入
- Sentryなどの外部ログサービス導入

