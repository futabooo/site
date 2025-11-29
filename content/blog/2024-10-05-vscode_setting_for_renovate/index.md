---
title: "VSCodeでRenovateの設定ファイルを使う時の設定"
description: "VSCodeでRenovateの設定ファイルを使う時の設定を紹介します"
tags: ["VSCode", "Renovate", "Prettier"]
pubDate: "2024/10/05"
---

# はじめに

Renovate を業務で使っていますが設定がたくさんあって覚えられないし、既存の設定ファイルのどれがなんのためにあるのかわからないのでコメント書きたいなーと思ったところから Renovate の設定ファイルではコメントが書ける.json5 の拡張子をサポートしていたのでこれを使えるようにしてコメントを書けるようにするまでいくつか設定が必要だったのでここに残します。

# 手順

## renovate の設定ファイルの拡張子を変更する

Renovate では以下の種類の設定ファイルが使えます。
今回は`renovate.json5`としました。

- renovate.json
- renovate.json5
- .github/renovate.json
- .github/renovate.json5
- .gitlab/renovate.json
- .gitlab/renovate.json5
- .renovaterc
- .renovaterc.json
- .renovaterc.json5

（package.json に renovate のセクションを追加することでも設定可能ですが 2024-10-05 現在において将来使えなくなることが記載されています）

https://docs.renovatebot.com/configuration-options/#configuration-options

## VSCode に json5 の拡張機能を追加する

なんか真っ赤になってると思うので拡張機能を追加します。

https://marketplace.visualstudio.com/items?itemName=mrmlnc.vscode-json5

## VSCode の settings.json に設定を追加する

json5 の拡張子のファイルを jsonc として扱うようにします。
以下の設定を追加します。

```json
  "files.associations": {
    "*.json5": "jsonc"
  }
```

## Prettier の設定を追加する

`.prettierrc.json5`にを以下の設定を追加します。

```json
{
  "overrides": [
    {
      // .json5ファイルを.jsoncファイルとしてフォーマットするVSCode用設定
      "files": ["*.json5"],
      "options": {
        "parser": "json"
      }
    }
  ]
}
```

## renovate.json5 で補完が効くようにする

ここはコメントとは関係ありませんがやります。
以下の設定を追加すると VSCode では補完が効くようになるはずが追加しただけで貼らななかったです。
これまでの設定を全てしたうえで、key 名はダブルクォーテーションで囲って書くようにしたら補完されるようになりました。

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json"
}
```

# おわりに

ここまで設定すると Renovate の設定にコメントが書けて補完もされて快適な Renovate 設定環境ができました。

# 参考

https://github.com/microsoft/beachball
