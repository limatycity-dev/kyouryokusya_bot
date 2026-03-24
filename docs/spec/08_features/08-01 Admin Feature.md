# 08-01 Admin Feature  
文明の基盤機能（カテゴリ作成・管理者管理・旧ユーザー登録）

---

# 1. 概要（Overview）
Admin feature は文明の運営に必要な **基盤機能** を提供する。

本 feature は以下の 3 つのサブ機能で構成される：

1. **setup** — 文明カテゴリの作成（建国）  
2. **admin** — 管理者の追加・削除（統治）  
3. **register（削除予定）** — 開発初期のユーザー手動登録（現在は非推奨）

---

# 2. サブ機能一覧

## 2-1. setup（文明カテゴリ作成）

### コマンド
```
/setup name:<string>
```

### 実行条件
- 実行者：Discord の **ManageChannels 権限**  
- BOT：ManageChannels 権限が必要  
- DM では使用不可

### 処理内容
1. カテゴリ名を生成  
   - `╭──── ⡇{name}`
2. カテゴリを作成
3. settings に category_id が存在するか確認  
   - 既に存在 → エラー
4. 以下のチャンネルを作成：

| チャンネル名 | 種類 |
|--------------|------|
| 🔔｜アナウンス | Text |
| 📝｜クエスト掲示板 | Forum |
| 📜｜ログ | Text |
| 📊｜ランキング | Text |
| 📕｜攻略本 | Forum |
| 📗｜フリーフォーラム | Forum |
| 💬｜雑談 | Text |

5. settings に保存  
6. 初代管理者として実行者を admins に登録  
7. ランキング初期メッセージを送信  
8. 成功メッセージを返す

---

## 2-2. admin（管理者追加・削除）

### コマンド
```
/admin add user:@target
/admin remove user:@target
```

### 実行条件
- 文明カテゴリ内で実行  
- settings に category_id が存在  
- 実行者が admins テーブルに登録されている（文明BOT管理者）

### 処理内容
#### add
```
INSERT INTO admins (category_id, user_id)
ON CONFLICT DO NOTHING
```

#### remove
```
DELETE FROM admins WHERE category_id = $1 AND user_id = $2
```

### 出力
- `{username} さんを管理者に追加しました。`
- `{username} さんを管理者から削除しました。`

---

## 2-3. register（削除予定 / deprecated）

### 状態
- **開発初期に使用されていたユーザー手動登録機能**
- 現在の正式フロー（interview → profile）では使用しない
- コード上は残っているが、**削除予定**

### コマンド
```
/register
```

### 実行条件
- Discord の **Administrator 権限** が必要  
- 文明カテゴリとは無関係

### 処理内容
1. users テーブルに user_id が存在するか確認  
2. 存在する → 「すでに登録されています。」  
3. 存在しない → INSERT  
4. 「{name} さんを登録しました！」

### 操作テーブル
```
users (user_id, name)
```

### 備考
- 面接（interview）をスキップするための開発初期ツール  
- 現在は **正式フロー外**  
- 仕様書では “deprecated（削除予定）” として扱う

---

# 3. エラー仕様（共通）

| エラー | 条件 | 表示 |
|--------|------|------|
| 文明カテゴリ外 | getCategoryId が null | 「文明カテゴリ内で実行してください。」 |
| 文明未登録 | settings に category_id が存在しない | 「このカテゴリは文明として登録されていません。」 |
| 管理者ではない | admins に user_id が存在しない | 「あなたはこの文明の管理者ではありません。」 |
| BOT 権限不足 | BOT に ManageChannels がない | 「BOT に `チャンネル管理` 権限がありません。」 |
| register 重複 | users に user_id が存在 | 「すでに登録されています。」 |

---

# 4. 将来拡張（Future Work）
- register の完全削除  
- 管理者権限の細分化  
- 管理者ログの追加  
- 文明カテゴリのテンプレート化  