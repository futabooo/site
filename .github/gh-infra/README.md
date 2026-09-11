# gh-infra

GitHub リポジトリの設定を宣言的に管理する。`site.yaml` が唯一の記述先。

## セットアップ

```sh
gh extension install babarot/gh-infra
```

## 使い方

```sh
gh infra validate .github/gh-infra   # スキーマ検証
gh infra plan     .github/gh-infra   # 差分表示（読み取りのみ）
gh infra apply    .github/gh-infra   # 適用（確認プロンプトあり）
```

GitHub の管理画面で設定を変えた場合は、以下で YAML に取り込み直す。

```sh
gh infra import futabooo/site > /tmp/site.yaml
```

## 管理対象外

gh-infra のスキーマに対応するフィールドが無いため、以下は管理画面での操作が必要。

- **auto-merge の有効/無効** (`allow_auto_merge`) — 現在は有効。Renovate の自動マージが依存している
- ruleset の `allowed_merge_methods`
- ruleset の `require_extra_approval_for_unattributed_changes` — 現在は有効

`plan` はこれらを差分として検出しないが、`apply` がこれらを保持するかは未検証。ruleset を変更するときは `apply` の前後で設定画面を確認すること。
