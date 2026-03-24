# 08-03_ranking 
文明BOT：ランキング機能 仕様書（実装完全準拠＋既知の懸念点＋累計ワイプ機能）

---

# 🎯 概要

ランキングは文明内の活動量を可視化するための機能。
ポイントは クエスト達成時 に付与され、
ランキングは user_stats テーブル を参照して生成される。
ランキングは以下の 3 種類を統合した 複合ランキング として表示される：
- 総合ポイントランキング（total_point）
- 週間ポイントランキング（weekly_point）
- 週間サマリー（weekly_tasks_created / weekly_tasks_completed）
これらをまとめて 1 つの embed として表示する。

---

# 🧩 データ構造（DB）

## user_stats（ランキングの本体）
| カラム | 説明 |
|--------|------|
| user_id | ユーザーID |
| category_id | 文明カテゴリ |
| total_point | 総合ポイント |
| weekly_point | 週間ポイント |
| updated_at | 最終更新日時 |
| PRIMARY KEY (user_id, category_id) |

### 重要仕様
- ランキングは user_stats を参照する
- クエスト達成時に自動で加算される
- weekly_point は週次リセット対象
- total_point は累計ワイプの対象


---

## users（週間タスク数の集計に使用）
| カラム | 説明 |
|--------|------|
| user_id | ユーザーID |
| name | 表示名 |
| weekly_tasks_created | 今週作成したクエスト数 |
| weekly_tasks_completed | 今週達成したクエスト数 |

### 重要仕様
- weekly_tasks_completed はクエスト達成時に +1  
- weekly_tasks_created はクエスト作成時に +1  
- ランキングのサマリーに使用される

---

## system（週次リセット管理）
| key | value |
|-----|--------|
| weekly_reset_key | 現在の週を示すキー |

---

# ⚠️ 既知の懸念点（実装上の問題点）

この仕様書は **現状の実装を忠実に反映** しているため、  
以下の “実装上の懸念点” も仕様として明記する。

---

## ❗ 懸念点①：`users.total_points` / `users.weekly_points` は実装で一切使用されない

現行 DB には以下のカラムが存在する：

- `users.total_points`
- `users.weekly_points`

しかし実装では：

- ポイント加算 → **user_stats**  
- ランキング参照 → **user_stats**  
- users のポイントカラムは **読み書きされない**

### → **完全に未使用カラムであり、削除推奨**

---

## ❗ 懸念点②：週間サマリーは “文明ごと” ではなく “全ユーザー合計”

`getWeeklySummary()` の SQL：

```sql
SELECT
  SUM(weekly_tasks_created),
  SUM(weekly_tasks_completed)
FROM users
```

category_id で絞っていないため：

- 文明 A のランキングに  
- 文明 B の週間タスク数も含まれる

### → **仕様としては「全文明合計」だが、意図と異なる可能性あり**

---

## ❗ 懸念点③：ランキングチャンネルのメッセージは毎回全削除

rankingService.updateRankingCombined():

- チャンネル内のメッセージを **全削除**
- embed を **1 つだけ再投稿**

### → メッセージ履歴が残らない  
### → 固定メッセージ方式ではない

---

# 🧩 ランキング更新のタイミング

ランキングは以下のタイミングで更新される：

| タイミング | 説明 |
|------------|------|
| **クエスト達成時（complete）** | 毎回即時更新される |
| **/ranking コマンド実行時** | 手動更新 |
| **/ranking-weekly コマンド実行時** | 手動更新 |
| **rankingService.updateRankingCombined() 呼び出し時** | 内部処理で更新 |

---

# 🧩 ランキングの構成（複合ランキング）

rankingService.updateRankingCombined() により、  
以下の 3 つのランキングが 1 つの embed にまとめられる。

---

## 1. 総合ポイントランキング（total_point）

### 参照元
```
SELECT * FROM user_stats
ORDER BY total_point DESC
```

### 表示形式
```
#1 <@userId> — **1200pt**
#2 <@userId> — **900pt**
```

---

## 2. 週間ポイントランキング（weekly_point）

### 参照元
```
SELECT * FROM user_stats
ORDER BY weekly_point DESC
```

### 表示形式
```
#1 <@userId> — **240pt**
#2 <@userId> — **180pt**
```

---

## 3. 週間サマリー（全ユーザー合計）

### 参照元
```
SELECT SUM(weekly_tasks_created), SUM(weekly_tasks_completed)
FROM users
```

### 表示形式
```
今週のクエスト作成数: **X 件**
今週のクエスト達成数: **Y 件**
```

---

# 🧩 ランキングの表示場所

ランキングは **settings.ranking_channel_id** に紐づくチャンネルに表示される。

### 仕様
- ランキングは **常に1メッセージのみ存在する**
- updateRankingCombined() は **チャンネル内のメッセージを全削除 → embed を再投稿**

---

# 🧩 embed の仕様（createCombinedRankingEmbed）

| 項目 | 内容 |
|------|------|
| タイトル | 文明ランキング（総合＋週間） |
| 色 | `#D2B48C` |
| フィールド1 | 🏆 総合ランキング（リアルタイム） |
| フィールド2 | 📅 週間ランキング |
| フィールド3 | 文明の今週の動き |
| ユーザー表示 | `<@userId>`（メンション） |
| ポイント表示 | `**太字**` |
| タイムスタンプ | 現在時刻 |

---

# 🧩 週次リセット

rankingService.ensureWeeklyResetIfNeeded() により自動判定される。

### リセット対象
- users.weekly_tasks_created = 0  
- users.weekly_tasks_completed = 0  
- user_stats.weekly_point = 0  

### リセット判定
- system.weekly_reset_key と現在の週キーを比較

---

🆕 🧩 累計ポイントワイプ（total_point reset） ← 新規追加
途中参加者のモチベーション維持、文明の季節性の確保のため、
累計ポイント（total_point）を任意のタイミングでリセットできる機能 を追加する。
🎯 目的
- 文明の “再スタート” を作る
- 途中参加者が追いつけるタイミングを作る
- 文明管理者が自由にワイプ時期を決められる
- 実装コストが最小で、既存仕様と干渉しない

🧩 コマンド仕様
/ranking-wipe-total
| 項目 | 内容 | 
| 説明 | 累計ポイント（total_point）を全ユーザー分リセットする | 
| 実行者 | 文明管理者のみ | 
| 効果 | user_stats.total_point を 0 に更新 | 
| 副作用 |  ランキングメッセージを再生成| 


🧩 処理フロー
- 文明カテゴリを判定
- 文明管理者か確認
- user_stats.total_point = 0 を全ユーザーに対して実行
- ランキングチャンネルのメッセージを全削除
- updateRankingCombined() を呼び出し、最新状態を再投稿
- 文明に通知（任意）

🧩 UI（通知メッセージ例）
🌙 文明の累計ランキングがリセットされました。
すべての参加者が同じスタートラインに立ちました。



🧩 エラー仕様
- 文明カテゴリ外 → 共通エラー
- 管理者権限なし → 共通エラー
- DB 更新失敗 → 赤 embed で通知


🧩 仕様の確定ポイント（更新版）
- ランキングは user_stats / users を参照
- クエスト完了時に自動更新
- 複合ランキングとして 1 つの embed にまとめる
- ranking_channel_id に常に 1 メッセージのみ存在
- updateRankingCombined() が常に最新状態を維持
- /ranking /ranking-weekly は管理者のみ
- close（終了）ではランキングは更新されない
- weekly_point / weekly_tasks は週次リセット対象
- total_point は /ranking-wipe-total により任意タイミングでリセット可能 ← NEW


---

# ⚠️ 既知の懸念点（再掲）

1. **users.total_points / users.weekly_points は未使用（削除推奨）**  
2. **週間サマリーは文明ごとではなく全ユーザー合計**  
3. **ランキングチャンネルのメッセージは毎回全削除される**
