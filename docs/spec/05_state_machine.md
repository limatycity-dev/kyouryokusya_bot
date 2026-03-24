```md
# 05_state_machine — 状態遷移仕様（最終版）

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
| **closed** | 完了または終了したクエスト。達成不可。 |

※ DB の `quests.status` に対応。

---

# 2. 状態遷移図（概念）

```
┌────────────┐
│  active    │
└─────┬──────┘
      │ 完了（complete）
      │ 終了（close）
┌─────▼──────┐
│   closed   │
└────────────┘
```

---

# 3. 状態遷移の詳細

## 3.1 active → closed

### ■ 遷移トリガー
- クエスト完了ボタン（quest-complete-button.ts）
- クエスト終了ボタン（quest-close-button.ts）
- 管理者による強制終了（将来拡張）

### ■ 遷移時の処理
- 完了時のみ quest_logs に達成ログを追加  
- **user_stats（total_point / weekly_point）をリアルタイム更新**  
- users.weekly_tasks_completed を加算  
- スレッド名を `✅ タイトル` に変更  
- スレッドをロック & アーカイブ  
- **message_id を使用してクエスト embed を終了状態に更新（安定版）**

### ■ 遷移後の状態
- status = "closed"
- **達成不可**
- **active に戻ることはない（不可逆）**

---

# 4. クエスト作成フロー（active 状態で誕生）

```
quest-create → quest-create-modal → quest-create.ts → DB INSERT → active
```

### ■ 作成時の処理
- quests にレコード追加（status = "active"）
- forum_thread_id を保存
- issuer_id を保存
- **BOT が投稿したクエスト embed の message_id を保存（安定版の中核）**
- users.weekly_tasks_created を加算
- user_stats の初期化（必要に応じて）

---

# 5. クエスト編集フロー（active / closed 共通）

```
quest-edit-button → quest-edit-modal → quest-edit-modal.ts → DB UPDATE
```

### ■ 編集可能な項目
- title  
- description  
- points  

### ■ 編集不可の項目（実装準拠）
- type  
- status  
- category_id  
- issuer_id  
- forum_thread_id  
- message_id  

### ■ 制約
- **closed 状態でも編集可能（実装仕様）**
- embed 更新は message_id を使用して行う（スレッド内検索は行わない）

---

# 6. クエスト完了フロー（active → closed）

```
quest-complete-button
  → quest_logs INSERT
  → user_stats UPDATE
  → users.weekly_tasks_completed UPDATE
  → closed
```

### ■ 完了時の処理
- quest_logs にログ追加  
- **user_stats.total_point / weekly_point を加算**  
- users.weekly_tasks_completed を加算  
- スレッドに完了メッセージ投稿  
- **single の場合は自動で closed に遷移し、embed を終了状態に更新**

---

# 7. クエスト終了フロー（active → closed）

```
quest-close-button → DB UPDATE → closed
```

### ■ 終了時の処理
- quest_logs は追加されない  
- ポイント加算なし  
- user_stats の更新なし  
- スレッドをロック & アーカイブ  
- **message_id を使って embed を終了状態に更新**

---

# 8. 状態遷移の不可逆性

クエストは一度 closed になると、  
**active に戻ることはできない。**

理由：
- ランキング整合性の維持  
- quest_logs の履歴保護  
- 文明の「記録」を改変しないため  

---

# 9. 将来の拡張（任意）

- 状態「archived」の追加（古いクエストの整理用）  
- 状態「draft」の追加（作成前の下書き）  
- 状態「review」の追加（承認制クエスト）  
```