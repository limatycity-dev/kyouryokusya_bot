```md
# 04_error_handling — エラー処理仕様（全体方針・最終版）

協力者求むBOT のエラー処理は  
**「ユーザーに優しく、開発者に厳しく」**  
を原則として設計されている。

本章では、文明全体に共通するエラー処理の思想・ルールを定義する。  
各 Feature の個別エラー仕様は 03_features に記載する。

---

# 1. 基本方針（Error Philosophy）

## 1.1 BOT は必ず返信する
Discord の仕様上、3 秒以内に返信または defer しないと UI エラーが発生する。

すべてのコマンド・ボタン・モーダルは以下を満たす：

- try/catch で囲む  
- catch 内で必ず reply または editReply  
- interaction.replied / deferred を確認し二重返信を防ぐ  

---

## 1.2 ユーザーには安全で簡潔なメッセージを返す

ユーザー向けエラーメッセージは以下に統一する：

> **「エラーが発生しました。もう一度お試しください。」**

機能固有の説明が必要な場合のみ、短く補足する。

---

## 1.3 開発者には詳細ログを残す

catch 内では必ず console.error を実行し、以下を含める：

- 機能名  
- error.message  
- error.stack  
- interaction 情報（user.id / commandName / customId / channelId など）  

---

## 1.4 DB エラーは必ずログに残す

すべての DB 操作（INSERT / UPDATE / SELECT / DELETE）は try/catch 内で実行する。

---

# 2. コンポーネント別の共通ルール

## 2.1 スラッシュコマンド
- ハンドラ全体を try/catch  
- catch 内で必ず ephemeral 返信  
- ログに機能名・ユーザー ID・エラー内容を含める  

---

## 2.2 モーダル
- 入力値のバリデーションを必ず行う  
- try/catch  
- 二重返信防止  
- 入力値は可能な範囲でログに残す  

---

## 2.3 ボタン
- try/catch  
- 返信は基本 ephemeral  
- DB 書き込みやメッセージ更新失敗は必ずログ  

---

# 3. message_id 対応に伴う共通エラー

クエスト機能など、message_id を参照する UI では以下のエラーが発生し得る。

## 3.1 message_id が NULL
- ユーザー：「クエストメッセージの情報が不足しているため、更新できません。」  
- ログ：「message_id 未設定」  

## 3.2 メッセージ取得失敗（fetch 失敗）
- ユーザー：「クエストメッセージが見つかりません。」  
- ログ：message_id / threadId / channelId  

## 3.3 embed 更新失敗
- ユーザー：「メッセージの更新中にエラーが発生しました。」  
- ログ：error / message_id  

## 3.4 スレッドロック・アーカイブ失敗
- ユーザー：影響なし（成功扱い）  
- ログ：error / threadId  

---

# 4. カテゴリ判定エラー（文明共通）

文明BOT は **カテゴリ単位で動作する** ため、  
カテゴリ外での操作は共通エラーとなる。

## 4.1 文明カテゴリ外
> **「文明カテゴリ内で実行してください。」**

## 4.2 文明未登録
> **「このカテゴリは文明として登録されていません。」**

## 4.3 管理者権限なし
> **「あなたはこの文明の管理者ではありません。」**

---

# 5. よくあるエラーと対処方針（文明共通）

## 5.1 DB 接続エラー
- すべてのコマンドが失敗  
- Discloud / DB 設定を確認  

## 5.2 モーダル入力値エラー
- 数値でない  
- 不正な type  
- → バリデーション追加  

## 5.3 ランキング更新エラー
- user_stats の整合性崩壊  
- → user_stats 再計算、quest_logs の確認  

---

# 6. ログフォーマット（推奨）

```text
[ERROR] 機能名 日時
内容: error.message
Stack: error.stack
Context: { userId, channelId, guildId, ... }
```

---

# 7. Discord 側の UI エラー回避

- 3 秒以内に reply または defer  
- 長時間処理は deferReply → editReply  
- モーダルは defer を検討  

---

# 8. 今後の拡張（任意）

- ログチャンネルへの自動エラー通知  
- エラーコード体系の導入  
- Sentry など外部ログサービスの導入  
```