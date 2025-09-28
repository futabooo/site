---
title: "Astroで作ってる個人ブログにPagefindを導入して検索機能を追加する"
description: "Astroで作ってる個人ブログにPagefindを導入して検索機能を追加する手順を説明します"
tags: ["Astro", "Pagefind", "Tailwind CSS"]
pubDate: "2025/01/12"
---

# はじめに

この記事は、記事執筆時点の Astro + Tailwind CSS + DaisyUI で構成されている前提で書かれています。

# Pagefind とは

Pagefind のページには最初に以下のように書いてあります。
なんか簡単に検索機能が追加できそうだったので、このブログに追加しました。

NavBar にある検索アイコンを押して検索してみると実際の動作を確認できます。

> Pagefind is a fully static search library that aims to perform well on large sites, while using as little of your users’ bandwidth as possible, and without hosting any infrastructure.

[Pagefind](https://pagefind.app/)

# 導入手順

基本的には Pagefind の Quick Start の通りにやれば導入することが可能です。ただそうすると UI が自分のブログのテーマと一致していないのが気になったり、検索 UI をモーダルで表示したいなどが叶えられないのでいくつか修正を加えました。

## ほどほどにカスタムしてテーマに合わせる

[Customising the styles | Pagefind](https://pagefind.app/docs/ui-usage/#customising-the-styles)にある通りカスタム CSS が用意されています。

```css
--pagefind-ui-scale: 1;
--pagefind-ui-primary: #034ad8;
--pagefind-ui-text: #393939;
--pagefind-ui-background: #ffffff;
--pagefind-ui-border: #eeeeee;
--pagefind-ui-tag: #eeeeee;
--pagefind-ui-border-width: 2px;
--pagefind-ui-border-radius: 8px;
--pagefind-ui-image-border-radius: 8px;
--pagefind-ui-image-box-ratio: 3 / 2;
--pagefind-ui-font: sans-serif;
```

私の場合は色さえ自分のブログと統一されていればよかったので以下のような CSS を追加しました。

```html
<style is:global>
  [data-theme="night"] {
    --pagefind-ui-primary: #9ca3af !important;
    --pagefind-ui-text: #9ca3af !important;
    --pagefind-ui-background: #0f172a !important;
    --pagefind-ui-border: #4b5563 !important;
    --pagefind-ui-tag: #4b5563 !important;
    --pagefind-ui-font: Noto Sans JP, Proxima Nova, system-ui, sans-serif !important;
  }

  [data-theme="winter"] {
    --pagefind-ui-primary: #1f2937 !important;
    --pagefind-ui-text: #374151 !important;
    --pagefind-ui-background: #ffffff !important;
    --pagefind-ui-border: #d1d5db !important;
    --pagefind-ui-tag: #e5e7eb !important;
    --pagefind-ui-font: Noto Sans JP, Proxima Nova, system-ui, sans-serif !important;
  }
</style>
```

以下の issue にあるように、pagefind の css を mediaqueries では上書きできないため、ダークモードと通常時での切り替えは data-theme の値を見るようにしています。

https://github.com/CloudCannon/pagefind/issues/614#issuecomment-2111199944

tailwind を使っているので、data-theme という key 名は`tailwind.config.cjs`で指定した値になっています。設定の詳細については[Customizing the selector | Tailwind CSS](https://tailwindcss.com/docs/dark-mode#customizing-the-selector)を参考にしてください。

[Styling Pagefind UI yourself | Pagefind](https://pagefind.app/docs/ui-usage/#styling-pagefind-ui-yourself) にある通り、以下の 1 行を追加しなければデフォルトの CSS を使わずに CSS を全部自分で書くことも可能です。
`<link href="/pagefind/pagefind-ui.css" rel="stylesheet">`

レイアウトも大幅に変えたいなどある時は全て自前で書くのもいいと思います。

## モーダルで表示する

こうなります。

```jsx
<dialog id="searchModal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-xs absolute right-2 top-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="fill-current h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </form>
    <div id="search-box" class="mt-4 mb-2"></div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<script is:inline src="/pagefind/pagefind-ui.js"></script>
<script is:inline>
  document.getElementById("search").addEventListener("click", () => {
    document.getElementById("searchModal").showModal();
  });
  document.addEventListener("DOMContentLoaded", () => {
    new PagefindUI({ element: "#search-box" });
  });
</script>
```

form で書かれている閉じるボタンにモーダル表示時にフォーカスが自動で当たってしまうのがなんとかできていないので、何とかしたいところですが検索機能自体は問題ありません。

# おわりに

Astro で Pagefind を導入する場合 integration 用意してくれてる人もいるのでこちらを使うのもありかもしれません。ただ素のまま導入してもそんなに大変ではないので、将来 Astro じゃなくなることがあるかもしれないと思うと integration は使わないのが無難かと思い私は素のままいれています。

https://github.com/shishkin/astro-pagefind
