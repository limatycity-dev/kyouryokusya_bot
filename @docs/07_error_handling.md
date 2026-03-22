```md
# 07_error_handling — エラー処理仕様（最終版）

協力者求むBOT のエラー処理は、  
「ユーザーに優しく、開発者に厳しく」を原則として設計されている。

- ユーザーには簡潔で安全なメッセージを返す  
- 開発者には詳細なログを残す  
- BOT が沈黙しないように必ず返信する  

本章では、エラー処理の方針・実装ルール・各機能の例外パターンを定義する。

---

# 1. 基本方針

## ✔ 1.1 BOT は必ず返信する
Discord の仕様上、  
**3 秒以内に返信 or defer しないと「問題が発生しました」になる。**

そのため、すべてのコマンド・ボタン・モーダルは  
**try/catch で囲み、catch 内で必ず返信する。**

---

## ✔ 1.2 ユーザーには安全なメッセージを返す
ユーザー向けのエラーメッセージは以下の形式に統一する。

@@@
エラーが発生しました。もう一度お試しください。
@@@

または、機能に応じた簡潔な説明。

---

## ✔ 1.3 開発者には詳細ログを出す
catch 内では必ず console.error を実行する。

@@@
console.error("QUEST CREATE ERROR:", error);
@@@

ログには以下を含める：

- 機能名  
- エラー内容  
- interaction 情報（必要に応じて）  

---

## ✔ 1.4 DB エラーは必ずログに残す
DB 書き込みは失敗しやすいため、  
**すべての INSERT / UPDATE / SELECT は try/catch 内で実行する。**

---

# 2. コマンドのエラー処理

---

## 2.1 スラッシュコマンド（/setup, /register, /ranking など）

### ■ 原則
- try/catch で囲む  
- catch 内で必ず interaction.reply（ephemeral）  
- ログに機能名を含める  

### ■ 例（setup）

@@@
try {
  // setup 処理
} catch (error) {
  console.error("SETUP ERROR:", error);
  return interaction.reply({
    content: "セットアップ中にエラーが発生しました。",
    ephemeral: true,
  });
}
@@@

---

# 3. モーダルのエラー処理

モーダルは特に失敗しやすい（入力値、DB、権限など）。

### ■ 原則
- try/catch  
- interaction.replied / deferred を確認して二重返信を防ぐ  

### ■ 例

@@@
catch (error) {
  console.error("QUEST CREATE MODAL ERROR:", error);
  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content: "クエスト作成中にエラーが発生しました。",
      ephemeral: true,
    });
  }
}
@@@

---

# 4. ボタンのエラー処理

ボタンは「押された瞬間に DB 書き込みが走る」ため、  
エラー発生率が高い。

### ■ 原則
- try/catch  
- DB 書き込みは必ずログ  
- 返信は ephemeral  

---

## 4.1 ランキング更新ボタン（ranking-refresh-button.ts）

### ■ よくあるエラー
- user_stats の取得失敗  
- ランキングチャンネルのメッセージ更新失敗  

### ■ 対処
- エラー時は以下を返す：

@@@
ランキングの更新中にエラーが発生しました。
@@@

---

# 5. よくあるエラーと対処方針

---

## 5.1 DB 接続エラー
**症状：**  
- すべてのコマンドが失敗  
- ログに `ECONNREFUSED` などが出る  

**対処：**  
- db/client.ts の接続設定を確認  
- Discloud の DB が落ちていないか確認  

---

## 5.2 カテゴリ外での操作
**症状：**  
- 「カテゴリ内で実行してください」エラー  

**原因：**  
- getCategoryId() が null を返した  

**対処：**  
- settings に正しい category_id が入っているか確認  
- チャンネル構造が正しいか確認  

---

## 5.3 モーダルの入力値エラー
**症状：**
- points が数値でない  
- type が不正  

**対処：**
- バリデーションを追加  
- エラーメッセージを返す  

---

## 5.4 ランキング更新エラー
**症状：**
- ランキングが更新されない  
- rankingService が例外を吐く  

**原因：**
- user_stats の整合性が崩れている  
- quest_logs のポイントが不正  

**対処：**
- user_stats を再計算する（将来のメンテ機能）  
- quest_logs の整合性を確認  

---

# 6. エラー発生時のログフォーマット

ログは以下の形式に統一する。

@@@
[ERROR] <機能名> <日時>
内容: <error.message>
Stack: <error.stack>
@@@

例：

@@@
[ERROR] QUEST COMPLETE 2026-03-20 14:22
内容: Cannot read properties of undefined
Stack: ...
@@@

---

# 7. Discord 側のエラー（「問題が発生しました」）の回避

このエラーは **BOT 側の例外ではなく、返信が遅れたときに出る UI エラー**。

### ■ 回避方法
- 3 秒以内に reply or defer  
- モーダルは特に defer を検討  
- 長時間処理は deferReply → editReply  

---

# 8. 今後の拡張（任意）

- ログチャンネルへの自動エラー通知  
- エラーコード体系の導入  
- Sentry などの外部ログサービス導入  
```