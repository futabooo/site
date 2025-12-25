---
title: "DartにおいてBufとprotocでprotoファイルの生成結果が異なるか調べる"
description: "DartにおいてBufとprotocでprotoファイルの生成結果が異なるか調べる"
tags: ["Buf","Dart","protobuf","gRPC"]
pubDate: "2023/08/11"
---

Bufが気になっています。

https://github.com/bufbuild/buf

すでにprotocをつかってprotoファイルからDartコードを生成している場合に、既存の生成結果と異なるようなことがあると移行する際に困ってしまうので調べました。

結論としては変わらないので移行するのは結構簡単そう。

### protocで生成する場合

macの場合ですが環境構築ではprotocとdartのprotoc_pluginが必要になりますので環境を用意します。

```
$ brew install protobuf
$ dart pub global activate protoc_plugin
```

生成する場合コマンドは下記です。
```
$ protoc --dart_out=grpc:lib/src/generated \
      -Iprotos protos/*.proto
```

### Bufで生成する場合

まずは環境を用意。

```
brew install buf
```

Bufではいくつかの設定ファイルを用意して下記コマンドでいけます。

生成するコマンドは下記です。
```
$ buf generate protos
```

用意する設定ファイルは下記です。

buf.gen.yaml
```
version: v1
managed:
  enabled: true
plugins:
  - plugin: buf.build/protocolbuffers/dart
    out: lib/src/generated
    opt:
      - grpc
```

protos/buf.yaml
```
version: v1
breaking:
  use:
    - FILE
lint:
  use:
    - DEFAULT
```

検証時のプロジェクトはこちらにあります。
https://github.com/futabooo/playground/tree/main/dart/grpc-server

## 余談

途中Dartようにinstallしてるプラグインのprotobuf.dartの21.0.0からコンストラクタ引数がすべて削除されるようになり、カスケード記法で必要なものはセットすることしかできなくなりました。ちょっと不便なのですがバイナリサイズ削減のために導入されたようです。

https://github.com/google/protobuf.dart/blob/master/protoc_plugin/CHANGELOG.md#2100