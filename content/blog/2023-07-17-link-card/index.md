---
title: "Astroでremark-link-cardをつかってリンクをカード形式で表示する"
description: "Astroでmarkdownで書いた記事をtailwindcss/typographyで表示する際にリンクをカード形式にする"
tags: ["Astro","remark"]
pubDate: "2023/07/17"
---

Astroのmarkdonwで書いた記事部分のHTML表示には[remark](https://github.com/remarkjs/remark)が使われており様々なプラグインを適用することができます。

remark-link-cardもその一つで、生リンクの記載をカード形式にして表示することができるプラグインです。

https://github.com/gladevise/remark-link-card


対応した際の差分は下記のリンク先にありますが、実際にいま見えているようなカード形式で表示することが可能です。

https://github.com/futabooo/astro-blog/commit/f3e794baa954353ff78d169710ae4a6c625df7ab


### ちょっとはまったところ

記事のCSSには[tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography)をつかっているのですが、リンクカードのCSSと競合してしまうのを回避する方法がよく分からず時間がかかってしまいました。

結論としてはリンクカード側のCSSを適用したい部分に`!important`を指定することで解決できました。

```
.rlc-favicon {
  margin-right: 4px;
  width: 16px;
  height: 16px;
  /* tailwind cssのprose内で使う際にmarginがproseで設定されているので無効にする */
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
```