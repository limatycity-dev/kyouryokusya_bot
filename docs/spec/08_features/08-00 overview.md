# 03_features Overview  
主要機能（Features）仕様書

## 1. 概要（What are Features?）
本プロジェクトは **feature-based architecture** を採用しており、  
すべての機能は `/src/features/*` として独立した「棚（feature）」として管理される。

この章（03_features）は、  
**各 feature の目的・データ・UI・コマンド・状態・運用を体系的にまとめた “文明の中心”** である。

## 2. 役割（Role of Features）
features は以下の役割を持つ：

- **機能単位で文明を分割し、保守性を最大化する**
- **コードと仕様書を 1:1 対応させる**
- **変更の影響範囲を明確化する**
- **UI / コマンド / DB / 状態遷移を feature ごとに整理する**

これにより、  
「どの棚（feature）が何を担当しているか」が一瞬で分かる文明が成立する。

## 3. features 一覧（Mapping to /src/features）
本プロジェクトの主要機能は以下の 5 つで構成される。

| Feature | 説明 | 対応ディレクトリ |
|--------|------|------------------|
| 03-01_admin | 管理者向け機能（設定・強制操作） | /src/features/admin |
| 03-02_interview | 初期面談（ユーザー onboarding） | /src/features/interview |
| 03-03_profile | プロフィール管理 | /src/features/profile |
| 03-04_quests | クエスト（タスク）管理 | /src/features/quests |
| 03-05_ranking | ランキング・スコア集計 | /src/features/ranking |

これらは **文明の主要機能（core gameplay loop）** を構成する。

## 4. features の構造（Feature Structure）
各 feature は以下の構造で記述される。

- **目的（Purpose）**
- **データ仕様（Data Schema）**
- **ステート（State Machine）**
- **コマンド（Commands）**
- **UI（Buttons / Modals / Embeds）**
- **運用フロー（Operation Flow）**
- **エラー仕様（Error Handling）**
- **将来拡張（Future Work）**

この統一フォーマットにより、  
どの feature も同じ “文明の型” で理解できる。

## 5. features と他章の関係（Cross-References）
features は以下の章と密接に連携する。

- **02_db_schema**  
  → 各 feature が使用するテーブルを参照  
- **04_state_machine**  
  → 全体の状態遷移と feature 間の流れ  
- **05_commands**  
  → feature ごとのコマンド仕様  
- **06_ui_spec**  
  → ボタン・モーダル・embed の UI 定義  
- **07_operation_flow**  
  → 管理者・日常運用のフロー  
- **08_error_handling**  
  → 共通エラーと feature ごとのエラー

03_features はこれらの “横断仕様” の中心に位置する。

## 6. 全体構造図（Feature Architecture）
```
User
 └─ Commands
      └─ Feature Logic (/src/features/*)
            ├─ Data Access (DB)
            ├─ UI (Buttons / Modals / Embeds)
            ├─ State Machine
            └─ Operation Flow
```

## 7. 今後の拡張性（Future Scalability）
feature-based architecture により、  
以下のような新機能を容易に追加できる。

- /src/features/guild  
- /src/features/season  
- /src/features/market  
- /src/features/achievement  

新しい棚を追加するだけで文明が拡張される。
