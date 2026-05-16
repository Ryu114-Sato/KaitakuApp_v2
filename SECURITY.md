# caretaxi-app セキュリティ対策 概要

## 目次

- [対策の目的](#対策の目的)
- [多層防御の構成](#多層防御の構成)
- [何がコミット対象から除外されているか](#何がコミット対象から除外されているか)
- [実装ファイル一覧](#実装ファイル一覧)
- [開発者ワークフロー](#開発者ワークフロー)
- [漏洩時の対応手順](#漏洩時の対応手順)
- [既知の制限と将来の改善](#既知の制限と将来の改善)

---

## 対策の目的

`caretaxi-app` は MongoDB Atlas の接続文字列・JWT シークレットを扱う。これらが GitHub に誤ってコミットされると以下が発生する:

- MongoDB Atlas への不正アクセス（患者・事業者データの漏洩）
- JWT シークレット漏洩による認証突破
- Render / クラウドサービスの不正利用

これを防ぐため、**4層の自動防御**を構築している。

---

## 多層防御の構成

```
┌──────────────────────────────────────────────┐
│ [1] .gitignore                               │
│   .env / *.pem / *.key をコミット禁止        │
└──────────────────────────────────────────────┘
                ↓ すり抜け対策
┌──────────────────────────────────────────────┐
│ [2] .gitleaks.toml                           │
│   useDefault + allowlist                     │
│   200+ のキー検出ルール（MongoDB等含む）     │
└──────────────────────────────────────────────┘
                ↓ ローカル防衛
┌──────────────────────────────────────────────┐
│ [3] .husky/pre-commit                        │
│   `gitleaks git --staged --redact -v`        │
│   コミット時に staged ファイルをスキャン     │
│   検出時はコミット阻止（exit 1）             │
└──────────────────────────────────────────────┘
                ↓ サーバ最終防衛
┌──────────────────────────────────────────────┐
│ [4] .github/workflows/secret-scan.yml        │
│   push / pull_request 時に GitHub Actions が │
│   gitleaks-action@v2 を自動実行              │
│   検出時はワークフロー失敗 → マージ不可      │
└──────────────────────────────────────────────┘
```

---

## 何がコミット対象から除外されているか

| 種類             | 例                              | 除外手段       |
| ---------------- | ------------------------------- | -------------- |
| 環境変数ファイル | `.env`、`.env.local` 等         | `.gitignore`   |
| 鍵・証明書       | `*.pem`、`*.key`                | `.gitignore`   |
| Nuxt ビルド      | `.nuxt/`、`.output/`            | `.gitignore`   |
| 依存パッケージ   | `node_modules/`                 | `.gitignore`   |
| OS 一時ファイル  | `.DS_Store`                     | `.gitignore`   |

**コミット可（安全）:**

- `.env.example`（プレースホルダのみ、実値なし）
- ソースコード `app/`、`server/`、`docs/`、`nuxt.config.ts` 等

---

## 実装ファイル一覧

| ファイル                              | 役割                              |
| ------------------------------------- | --------------------------------- |
| `.gitignore`                          | Git 追跡対象から除外              |
| `.gitleaks.toml`                      | gitleaks の検出ルール・誤検知抑制 |
| `.husky/pre-commit`                   | コミット時の自動スキャン          |
| `.github/workflows/secret-scan.yml`   | サーバ側自動スキャン              |
| `.env.example`                        | `.env` のテンプレート（実値なし） |

---

## 開発者ワークフロー

### 初回セットアップ

```bash
# 1. 依存パッケージ
npm install

# 2. .env を実値で作成
cp .env.example .env
# → MONGODB_URI と JWT_SECRET に実値を入れる

# 3. gitleaks をインストール（macOS）
brew install gitleaks

# 4. husky フックを有効化
npx husky init
```

### 通常のコミット

`git commit` を実行するたびに自動で:

1. pre-commit フックが起動
2. `gitleaks git --staged --redact -v` が staged ファイルをスキャン
3. シークレットが検出されればコミット阻止、なければコミット成立

### 手動スキャン

```bash
# git 履歴全体
gitleaks git . -v --log-opts="--all"

# 作業ディレクトリ
gitleaks dir . -v
```

---

## 漏洩時の対応手順

### Step 1: 即時にキーを失効させる

| プロバイダ    | 失効URL                                          |
| ------------- | ------------------------------------------------ |
| MongoDB Atlas | https://cloud.mongodb.com → Security → Database Access |
| Render        | https://dashboard.render.com → Environment Variables |

### Step 2: 履歴から完全消去

```bash
git filter-repo --path .env --invert-paths
```

### Step 3: リモートを強制プッシュ

```bash
git push origin --force --all
```

### Step 4: 新しいキーを発行して `.env` に反映

---

## 既知の制限と将来の改善

- `gitleaks protect --staged` は v8 で廃止のため `gitleaks git --staged` を使用
- 低エントロピーのフェイク値（`XXXX...`）は検出されない（誤検知防止のため）
- 公開リポジトリ化する際は過去の履歴を `git filter-repo` で精査すること
