---
title: "GitHub Actionsとtagprを使ってpub.devへのリリースを楽にする"
description: "GitHub Actionsとtagprを使ってDartやFlutterのライブラリをpub.devへのリリースを楽にする方法を紹介します"
tags: ["GitHub Actions", "CICD"]
pubDate: "2024/12/31"
---

# pub.dev での設定

`https://pub.dev/packages/{yout_package_name}/admin` の Automated publishing に書いてあることを自分の環境で必要な設定やれば基本的には問題ないです。

# GitHub Actions の設定

tagpr の workflow は以下で、工夫点がいくつかあります。

1 つ目は、tagpr の workflow で作る tag で後続の workflow がトリガーされるように `secrets.GITHUB_TOKEN` や `github.token` の token は使わないことです。個人で作る Personal Accsess Token でも良いですし、GitHub Apps で作る token でも良いですが自分の場合は後者を使用しています。

2 つ目は、セキュリティ的観点から、third-party GitHub Actions を使うときに commit hash を指定していることです。

```yaml
name: tagpr

on:
  push:
    branches: ["main"]

jobs:
  tagpr:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: write
      pull-requests: write
    outputs:
      tag: ${{ steps.tagpr.outputs.tag }}
    steps:
      - uses: actions/create-github-app-token@c1a285145b9d317df6ced56c09f525b5c2b6f755 # v1.11.1
        id: app-token
        with:
          app-id: ${{ vars.APP_ID }}
          private-key: ${{ secrets.PRIVATE_KEY }}

      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          token: ${{ steps.app-token.outputs.token }}

      - uses: Songmu/tagpr@3dca11e7c0d68637ee212ddd35acc3d30a7403a4 # v1.5.0
        id: tagpr
        env:
          GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}
```

pub.dev へ公開する workflow は以下です。

`dart-lang/setup-dart`に用意されている reusable workflows を使います。注意点としては reusable workflows は job レベルでしか使えないので step に指定することはできません。pub.dev 側の設定を済ませておくと pub.dev への公開は実質この reusable workflows を呼び出すだけで完了します。以下の workflow では公開が成功したら GitHub Release も作るようにしています。

```yaml
name: Release

on:
  push:
    tags:
      - "[0-9]+.[0-9]+.[0-9]+*"

jobs:
  publish:
    permissions:
      id-token: write # Required for authentication using OIDC
    uses: dart-lang/setup-dart/.github/workflows/publish.yml@e630b99d28a3b71860378cafdc2a067c71107f94 # v1.7.0
    with:
      environment: pub.dev

  release:
    needs: [publish]
    if: ${{ needs.publish.result == 'success' }}
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - name: Create GitHub Release
        uses: softprops/action-gh-release@7b4da11513bf3f43f9999e90eabced41ab8bb048 # v2.2.0
        with:
          body_path: CHANGELOG.md
          tag_name: ${{ github.ref_name }}
          token: ${{ secrets.GITHUB_TOKEN }}
```
