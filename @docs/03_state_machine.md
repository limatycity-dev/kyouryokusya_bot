```md
# 03_state_machine — 状態遷移仕様（最終版）

協力者求むBOT の中心となる「クエスト（quests）」は、  
明確な状態遷移（State Machine）を持つ。

この章では、クエストのライフサイクルを  
**状態（State）** と **遷移（Transition）** に分けて定義する。

---

# 1. クエストの状態一覧

クエストは以下の 2 状態を持つ。

| 状態 | 説明 |
|------|------|
| **active** | 進行中のクエスト。ユーザーが達成できる状態。 |
| **closed** | 完了または終了したクエスト。編集不可。 |

※ DB の `quests.status` に対応。

---

# 2. 状態遷移図（概念）

@@@
┌────────────┐
│  active    │
└─────┬──────┘
      │ 完了（complete）
      │ クローズ（close）
┌─────▼──────┐
│   closed   │
└────────────┘
@@@

---

# 3. 状態遷移の詳細

## 3.1 active → closed

### ■ 遷移トリガー
- クエスト完了ボタン（quest-complete-button.ts）
- クエストクローズボタン（quest-close-button.ts）
- 管理者による強制終了（将来拡張）

### ■ 遷移時の処理
- 完了時のみ quest_logs に達成ログを追加  
- users のポイントを加算  
- users.weekly_points / weekly_tasks_completed を更新  
- **user_stats（ランキングキャッシュ）のリアルタイム更新**  
- スレッドをロック（必要に応じて）

### ■ 遷移後の状態
- status = "closed"
- 編集不可
- **再度 active に戻ることはない（不可逆）**

---

# 4. クエスト作成フロー（状態遷移前の準備）

クエストは以下の手順で生成される。

@@@
quest-create → quest-create-modal → quest-create.ts → DB INSERT → active 状態で誕生
@@@

### ■ 作成時の処理
- quests にレコード追加（status = "active"）
- forum_thread_id を保存
- issuer_id を保存
- users.weekly_tasks_created を加算
- **user_stats のリアルタイム更新（必要に応じて）**

---

# 5. クエスト編集フロー（active 状態のみ）

@@@
quest-edit-button → quest-edit-modal → quest-edit-modal.ts → DB UPDATE
@@@

### ■ 編集可能な項目
- title  
- description  
- points  
- type  

### ■ 編集不可の項目
- status  
- category_id  
- issuer_id  
- forum_thread_id  

### ■ 制約
- closed 状態では編集不可

---

# 6. クエスト完了フロー（active → closed）

@@@
quest-complete-button
  → quest-complete-button.ts
  → quest_logs INSERT
  → users UPDATE
  → user_stats UPDATE
  → closed
@@@

### ■ 完了時の処理
- quest_logs にログ追加  
- users.total_points を加算  
- users.weekly_points を加算  
- users.weekly_tasks_completed を加算  
- **user_stats（total_point / weekly_point）をリアルタイム更新**  
- スレッドに完了メッセージ投稿（実装依存）

---

# 7. クエストクローズフロー（active → closed）

@@@
quest-close-button → quest-close-button.ts → DB UPDATE → closed
@@@

### ■ クローズ時の処理
- quest_logs は追加されない  
- ポイント加算なし  
- user_stats の更新なし  
- スレッドをロック（必要に応じて）

---

# 8. 状態遷移の不可逆性

クエストは一度 closed になると、  
**active に戻ることはできない。**

理由：
- ポイント計算の整合性を保つため  
- ランキングの再計算を避けるため  
- 文明の「記録」を改変しないため  

---

# 9. 将来の拡張（任意）

- 状態「archived」の追加（古いクエストの整理用）  
- 状態「draft」の追加（作成前の下書き）  
- 状態「review」の追加（承認制クエスト）  
```