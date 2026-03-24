```md
# 07_permissions — 権限仕様（最終版）

協力者求むBOT の動作は Discord の権限体系に強く依存する。  
本章では、BOT・管理者・一般ユーザーが必要とする権限を  
**文明全体の横断仕様** として定義する。

個別 Feature の権限要件は 08_features に記載されるが、  
ここでは文明全体に共通するルールをまとめる。

---

# 1. 権限モデルの基本思想

文明BOT の権限設計は以下の原則に基づく：

1. **BOT は必要最小限の権限のみを要求する**  
2. **管理者は「文明BOT管理者（admins テーブル）」で判定する**  
3. **Discord の Administrator 権限とは独立している**  
4. **カテゴリ（文明）単位で権限を管理する**  
5. **ユーザーには余計な権限を与えない**

---

# 2. BOT が必要とする権限（Guild 権限）

BOT が正常に動作するために必要な権限は以下の通り。

| 権限 | 用途 |
|------|------|
| **Manage Channels** | /setup によるカテゴリ・チャンネル作成、面接チャンネル作成 |
| **Manage Messages** | ランキングチャンネルのメッセージ全削除、embed 更新 |
| **Send Messages** | クエスト embed、ログ、ランキング投稿 |
| **Embed Links** | クエスト・ランキング embed の表示 |
| **Read Message History** | message_id を使ったメッセージ取得 |
| **Manage Threads** | クエストスレッドのロック・アーカイブ |
| **Use Application Commands** | スラッシュコマンド実行 |

### 備考
- BOT に Administrator 権限は不要（推奨しない）
- 特に **Manage Channels** と **Manage Messages** が必須

---

# 3. 管理者（文明BOT管理者）の権限モデル

文明BOT の管理者は **admins テーブル** によって管理される。

### ■ 管理者の定義
- `/setup` 実行者が初代管理者として登録される  
- `/admin add` によって追加される  
- Discord の Administrator 権限とは無関係  

### ■ 管理者が実行できる操作
| 操作 | 説明 |
|------|------|
| /setup | 文明カテゴリの作成 |
| /admin add / remove | 文明BOT管理者の追加・削除 |
| クエスト編集 | quest-edit-button |
| クエスト終了 | quest-close-button |
| ランキング初期化 | /ranking-init |
| ランキング手動更新 | /ranking |
| 週間ランキング更新 | /ranking-weekly |
| 面接終了 | /interview-close |

---

# 4. 一般ユーザーの権限モデル

一般ユーザーが実行できる操作は以下の通り。

| 操作 | 説明 |
|------|------|
| クエスト完了 | quest-complete-button |
| 面接開始 | ガイドラインのボタン |
| プロフィール設定 | /profile-setup の UI で選択 |

### 備考
- クエスト作成は **管理者のみ**（現行仕様）
- 一般ユーザーは文明カテゴリ内のチャンネル閲覧権限が必要

---

# 5. 文明カテゴリ（Category）内の権限構造

文明カテゴリは `/setup` によって自動生成され、  
以下の権限構造を持つ。

## 5.1 @everyone（一般ユーザー）
| 権限 | 状態 |
|------|------|
| View Channel | 許可 |
| Send Messages | 許可（雑談・フォーラム） |
| Create Threads | 許可（フォーラム） |
| Manage Threads | 不可 |

---

## 5.2 文明BOT（BOT）
| 権限 | 用途 |
|------|------|
| Manage Channels | スレッド作成・カテゴリ管理 |
| Manage Messages | embed 更新、ランキング削除 |
| Manage Threads | クエストスレッドのロック・アーカイブ |
| Read Message History | message_id 取得 |
| Send Messages | embed 投稿 |

---

## 5.3 文明BOT管理者（admins）
| 権限 | 用途 |
|------|------|
| クエスト編集 | quest-edit-button |
| クエスト終了 | quest-close-button |
| ランキング操作 | /ranking, /ranking-weekly, /ranking-init |
| 面接終了 | /interview-close |

※ Discord 権限ではなく **admins テーブル** による判定。

---

# 6. 面接カテゴリの権限構造

面接機能は Discord 権限を直接操作するため、  
権限仕様を明確に定義する。

## 6.1 面接カテゴリ（INTERVIEW_CATEGORY_ID）
| 対象 | 権限 |
|------|------|
| @everyone | ViewChannel: deny |
| 応募者 | ViewChannel / SendMessages: allow |
| 管理者ロール（Administrator 権限） | ViewChannel / SendMessages: allow |

### 特徴
- 応募者と管理者以外は完全に見えない  
- DB を使わず、**カテゴリ位置＝状態** で管理する  

---

## 6.2 面接アーカイブカテゴリ（INTERVIEW_ARCHIVE_CATEGORY_ID）
| 対象 | 権限 |
|------|------|
| 応募者 | ViewChannel: allow（仕様） |
| 管理者 | ViewChannel: allow |

### 備考
- `/interview-close` は権限を変更しない  
- 応募者はアーカイブ後も閲覧可能（仕様）

---

# 7. ランキングチャンネルの権限

ランキングチャンネルは BOT が完全管理する。

| 権限 | 状態 |
|------|------|
| @everyone: SendMessages | deny |
| BOT: ManageMessages | allow |
| BOT: SendMessages | allow |

### 特徴
- メッセージは常に 1 件のみ  
- BOT が全削除 → 再投稿を行うため、ManageMessages が必須

---

# 8. クエスト掲示板（Forum）の権限

| 権限 | 説明 |
|------|------|
| @everyone: CreateForumPost | allow |
| @everyone: SendMessages | allow |
| BOT: ManageThreads | allow |
| BOT: SendMessages | allow |

### 特徴
- クエストは Forum スレッドとして作成される  
- BOT がスレッドをロック・アーカイブするため ManageThreads が必要  

---

# 9. 今後の拡張（任意）

- 文明ごとの権限テンプレート化  
- BOT の権限チェックの自動化  
- 管理者権限の細分化（クエスト管理者 / ランキング管理者など）  
- 面接権限の柔軟化（応募者の閲覧制御）  

```