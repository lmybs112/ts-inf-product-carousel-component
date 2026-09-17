# Product Carousel Widget — 設計規格

日期：2026-09-17  
狀態：待實作（設計已與使用者確認 §1–§3）

## 目標

新增一支 **ESM** 腳本，功能與現有 `inf-product-carousel-component.js` **全功能對等**，但使用方式改為兩行：

```js
await import('https://<cdn>/inf-product-carousel-widget.js');
window.InfFitsProductCarousel.mount({ brand, GA4Key, carousels });
```

**硬性約束**

- **不修改** `inf-product-carousel-component.js`
- **不**以 wrapper 去載入／呼叫舊檔；新檔為獨立重寫
- 舊站繼續用舊 API；新整合用新 API；兩套可同頁並存

---

## §1 對外 API

### 檔案

| 項目 | 值 |
|------|-----|
| 新檔 | `inf-product-carousel-widget.js` |
| 全域物件 | `window.InfFitsProductCarousel` |
| 掛載入口 | `mount(config)` |
| Custom element | `<inf-product-carousel-widget>`（與舊 tag 不同，避免衝突） |

### 使用範例

```js
await import('https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js');

window.InfFitsProductCarousel.mount({
  brand: 'DES',
  GA4Key: 'G-G3WD6KWQG4',
  carousels: [
    { type: 'popup', /* 與現況相同的 carousel 欄位 */ },
    { type: 'product', showPositionId: { top: 'infFitsHeader', bottom: 'infFitsFooter' } }
  ]
});
```

相容單筆：`carousel: { type: 'product', ... }`（有 `carousel` 時優先，不展開 `carousels`，與舊規則一致）。

### 對外表面

| API | 說明 |
|-----|------|
| `InfFitsProductCarousel.mount(config)` | 唯一掛載入口；一次可掛 product + popup |
| `window.showPopup` / `closePopup` / `resetRecom` | 有掛 popup 且啟用時，行為對齊舊組件 |

### 參數契約

- 結構與現有 `initInfProductCarouselComponent` **相同**：頂層 `brand` / `GA4Key` / `carousel` \| `carousels`，以及既有 `carousel.*` 欄位（見 `USAGE.md`）。
- **不另發明一層預設**（例如不自動猜 brand／GA4Key）。
- 內部行為對齊舊組件既有 fallback（舊組件本身已有的預設值可保留對等行為，但不在新 API 文件中宣稱「新的預設策略」）。
- 缺關鍵設定（例如完全沒有 `carousel` 且沒有 `carousels`）時：`throw new Error(...)`，不靜默無掛載。

---

## §2 內部結構與功能對等

單檔 ESM，檔內依職責分區：

| 區塊 | 職責 |
|------|------|
| `mount` / 實例管理 | 解析 config、展開 carousels、防重複掛載、建立 custom element |
| Brand config | `GetItems` API、convertBrandConfig、`status` / `Location` |
| SKU / 會員 | shopline / 91APP / 自動判斷、dataLayer 會員 |
| 推薦資料 | product / popup endpoint、series_*、customEdm、localStorage 快取 |
| 渲染 | Shadow DOM、Swiper、箭頭／title-nav、尺寸／折扣 |
| Popup | 浮動層、show/close/resetRecom、autoShow |
| GA4 | ensureGtagLoaded、sendGAEvent（單一路徑；事件表對齊乾淨版 GA4.md） |
| 後端點擊 | recordMktClick（僅商品點擊） |

### 功能對等清單

| 能力 | 要求 |
|------|------|
| `type: product` 嵌入 | 必須 |
| `type: popup` | 必須 |
| 一次 `carousels` 多實例 | 必須 |
| brandConfig API + 本地覆寫 | 必須 |
| sku 自動／指定 | 必須 |
| 推薦模式 bhv/corr/sp_* | 必須 |
| Swiper + 響應式箭頭／title-nav | 必須 |
| GA4（有 GA4Key 才發送） | 必須；每次互動一筆事件 |
| recordMktClick | 必須 |
| 推薦快取清理 | 必須 |
| 與舊 custom element 同頁 | 必須（不同 tag） |

### 刻意不做

- 不 import／依賴舊的 `inf-product-carousel-component.js`
- 不改舊檔、不強制既有 GTM 遷移
- 不在新 API 加「自動偵測 Measurement ID／brand」之類新預設

### 驗證

- 新增 `demo-widget.html`：兩行 import + mount，config 對齊現有 `demo.html`
- 對照：輪播、popup、點商品／箭頭／title-nav 各只打一筆正確 GA4 事件

---

## §3 檔案與 rollout

### 新增

| 檔案 | 說明 |
|------|------|
| `inf-product-carousel-widget.js` | 新 ESM 全功能實作 |
| `demo-widget.html` | 兩行用法示範 |
| 本規格文件 | 設計定稿 |

### 不動

| 檔案 | 說明 |
|------|------|
| `inf-product-carousel-component.js` | 零改動 |
| 既有 `demo.html` 等舊示範 | 保留 |

### 並存

```
舊：script → initInfProductCarouselComponent(...)
新：await import(widget.js) → InfFitsProductCarousel.mount(...)
```

CDN 預期路徑（與現有 Vercel 專案同輸出）：

`https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js`

### 成功標準

1. `demo-widget.html` 兩行即可掛上 product + popup  
2. 行為與 `demo.html` 舊寫法功能對等  
3. 有 `GA4Key` 時 GA4 事件乾淨（一點一筆、名稱正確）  
4. 舊檔無變更  

---

## 實作備註

- 實作前另寫 implementation plan（writing-plans）
- 建議實作順序：mount 骨架 → product 渲染／推薦 → popup → GA4／recordMktClick → demo-widget 驗證 → 對照舊 demo 修差異
