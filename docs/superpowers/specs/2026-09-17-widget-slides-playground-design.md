# 設計：投影片內嵌即時上手 playground

日期：2026-09-17  
狀態：已核准（對話設計）  
範圍：僅文件／投影片 UX；不改 `inf-product-carousel-widget.js`

## 目標

在 `docs/WIDGET-slides.html` 新增一頁，讓使用者能：

1. 即時調整參數並在模擬頁面看到 product／popup 效果
2. 一鍵複製可直接貼到真實環境的引入碼（固定正式 CDN）

## 決策摘要

| 項目 | 決定 |
|------|------|
| 呈現位置 | 僅投影片內嵌（不新增獨立 playground 檔） |
| 實作方式 | `<template id="svg-playground">` 注入，與 `#arch-diagram` 相同機制 |
| 互動深度 | 基本欄位（方案 2）+ 可摺疊進階（方案 3） |
| 可複製 import | 固定 `https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js` |
| 預覽 import | 相對路徑 `../inf-product-carousel-widget.js`（本機開 slides 可跑） |

## 版面

單頁三欄（≤980px 改為直向堆疊）：

1. **左：控制台** — 基本設定；「進階設定」`<details>` 預設收合
2. **中：預覽** — `#pgHeader` / `#pgContent` / `#pgFooter`，popup 掛載用容器 id 對齊表單
3. **右：程式碼** — `<pre>` 即時更新 +「複製程式碼」按鈕（成功／失敗短暫提示）

視覺：沿用 slides 暗色 token，控制項簡潔，不引入額外框架。

## 欄位

### 基本（一律顯示）

| 控制項 | 對應 | 預設 |
|--------|------|------|
| 掛載模式 | 組出 `carousels` | `兩者`（product + popup） |
| brand | `brand` | `DES` |
| GA4Key | `GA4Key` | 空字串（預覽不強制打 GA） |
| Title | popup `brandConfig.Title` | `您可能會喜歡`（僅 popup／兩者時相關） |

掛載模式選項：`product` | `popup` | `兩者`。

### 進階（預設收合）

| 控制項 | 對應 | 預設 |
|--------|------|------|
| RecommendMode | `brandConfig.RecommendMode` | `bhv` |
| CarouselLayout | `brandConfig.CarouselLayout` | `2.5` |
| DisplayMode | `brandConfig.DisplayMode` | `SaleRate` |
| CarouselButton | `brandConfig.CarouselButton` | `true` |
| Location | `brandConfig.Location` | `bottom` |
| status | `brandConfig.status` | `true` |
| showPositionId.top | product | `infFitsHeader`（預覽容器實際 id 映射為 `pgHeader`，**可複製碼用表單顯示值**） |
| showPositionId.bottom（product） | product | `infFitsFooter` |
| showPositionId.bottom（popup） | popup | `popupProductContent` |

說明：預覽區 DOM id 使用 `pg*` 前綴避免與投影片其他節點衝突；組 **可複製碼** 時使用使用者在進階欄看到的 id（預設正式環境慣用 id）。掛載預覽時把 config 的 `showPositionId` **映射**到 `pgHeader`／`pgFooter`／預覽用 popup 容器。

## 行為

1. 進入「即時上手」頁時初始化 playground（載入 widget ESM 一次）。
2. 任一控制項變更 → debounce ~200ms →：
   - 移除既有 `inf-product-carousel-widget` 與殘留 popup DOM（若需要）
   - 以映射後的 preview config 呼叫 `InfFitsProductCarousel.mount`
   - 更新右側 CDN 版原始碼字串
3. 「複製程式碼」：`navigator.clipboard.writeText`；失敗時 fallback 選取文字或提示。
4. 離開該頁：不強制銷毀實例（簡化）；再次進入若已掛載可先清再掛，避免重複。
5. mount 拋錯時：預覽區顯示錯誤訊息，不中斷投影片翻頁。

## 可複製碼形狀

```js
await import('https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js');

window.InfFitsProductCarousel.mount({
  brand: '…',
  GA4Key: '…',
  carousels: [ /* 依模式與進階欄位組出 */ ]
});
```

- 僅 product：一個 `{ type: 'product', showPositionId }`
- 僅 popup：一個 `{ type: 'popup', showPositionId, brandConfig }`
- 兩者：陣列含 popup + product（順序與 `demo-widget.html` 對齊：popup 在前）

## 檔案變更

| 檔案 | 變更 |
|------|------|
| `docs/WIDGET-slides.html` | 新 Markdown 頁、template、CSS、playground 邏輯；擴充 `#play-` 或沿用 `#playground` 注入 |
| `WIDGET.md` | 第 17 節補一句：投影片含即時上手頁 |

不改：`inf-product-carousel-widget.js`、`demo-widget.html`（可保留作純示範）。

## 注入約定

- Markdown：`![即時上手](#playground)`
- Template：`id="svg-playground"`
- 既有 SEQ 正則需能匹配 `playground`（擴充為 `(?:seq|arch|play)[a-z0-9-]*` 或明確加入 `playground`）

建議正則：

```js
/<!--SEQ:((?:seq|arch|play)[a-z0-9-]*)-->/g
```

並保證 `![…](#playground)` → `play` 開頭的 id：使用 `#playground`，template `svg-playground`。

## 驗證

- 本機開 `docs/WIDGET-slides.html`，進「即時上手」可見輪播／popup（需網路打 API）
- 改模式／brand／進階欄位後預覽更新，右側碼同步
- 複製後貼到空白 HTML + 對應容器 id 可運作（CDN）
- 其他投影片頁翻頁不受影響

## 非目標

- 不實作完整 bid／量體欄位編輯
- 不新增獨立 `docs/widget-playground.html`
- 不做 e2e 自動化（手動驗證即可）
