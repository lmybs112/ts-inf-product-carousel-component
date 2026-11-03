# Product Carousel Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增獨立 ESM `inf-product-carousel-widget.js`，功能與舊組件全對等，對外僅 `await import(...)` + `InfFitsProductCarousel.mount(config)`。

**Architecture:** 單檔 ESM 重寫（不 import 舊檔）。Custom element tag 為 `inf-product-carousel-widget`。行為／API 參數對齊 `inf-product-carousel-component.js` + `USAGE.md` + 乾淨版 `GA4.md`。純函式（config 正規化、事件名、推薦 URL）可在 Node 用 `node --test` 驗證；瀏覽器行為用 `demo-widget.html` 驗證。

**Tech Stack:** Vanilla JS（ESM）、Web Components（Shadow DOM）、jQuery／Swiper（執行期動態載入，對齊舊組件）、GA4 gtag、infFITS REST API。

## Global Constraints

- **禁止修改** `inf-product-carousel-component.js`（每任務結束用 `git diff -- inf-product-carousel-component.js` 確認空）
- **禁止** wrapper 載入舊檔；新檔必須獨立可運作
- 參數結構與舊 `initInfProductCarouselComponent` 相同；不另發明 brand／GA4Key 自動猜測
- 缺 `carousel` 且缺 `carousels` 時：`throw new Error(...)`
- GA4：有 `GA4Key` 才發送；每次點擊只打一筆；事件名對齊 `GA4.md`
- Custom element：`inf-product-carousel-widget`（勿與舊 tag 衝突）
- 全域：`window.InfFitsProductCarousel.mount`；popup 時提供 `showPopup` / `closePopup` / `resetRecom`

---

## File Map

| 檔案 | 職責 |
|------|------|
| `inf-product-carousel-widget.js` | 全功能 widget + mount API（新建） |
| `demo-widget.html` | 兩行用法示範（新建） |
| `scripts/widget-pure.test.mjs` | 純函式單元測試（新建，Node） |
| `inf-product-carousel-component.js` | **不動** |
| `docs/superpowers/specs/2026-09-17-product-carousel-widget-design.md` | 設計規格（已定稿） |

行為對照來源（只讀）：

- `inf-product-carousel-component.js`（邏輯來源）
- `USAGE.md`、`GA4.md`、`demo.html`

---

### Task 1: Mount 契約與純函式骨架

**Files:**
- Create: `inf-product-carousel-widget.js`
- Create: `scripts/widget-pure.test.mjs`

**Interfaces:**
- Produces:
  - `export function assertMountConfig(config)` → void；無效則 throw
  - `export function expandMountConfigs(config)` → `Array<{ brand, GA4Key, carousel }>`
  - `export function buildItemEventName(eventRecom, testSuffix = 'A')` → string
  - `export function resolveRecommendApiUrl({ brand, carouselType, series_in, series_out })` → string
  - `window.InfFitsProductCarousel = { mount }`（mount 先可只做 config 展開 + throw，尚未建 DOM）

- [ ] **Step 1: 寫失敗測試（純函式）**

建立 `scripts/widget-pure.test.mjs`：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertMountConfig,
  expandMountConfigs,
  buildItemEventName,
  resolveRecommendApiUrl
} from '../inf-product-carousel-widget.js';

test('assertMountConfig throws without carousel(s)', () => {
  assert.throws(() => assertMountConfig({ brand: 'DES' }), /carousel/);
});

test('expandMountConfigs expands carousels', () => {
  const list = expandMountConfigs({
    brand: 'DES',
    GA4Key: 'G-X',
    carousels: [{ type: 'product' }, { type: 'popup' }]
  });
  assert.equal(list.length, 2);
  assert.equal(list[0].carousel.type, 'product');
  assert.equal(list[0].GA4Key, 'G-X');
});

test('expandMountConfigs prefers single carousel', () => {
  const list = expandMountConfigs({
    brand: 'DES',
    carousel: { type: 'product' },
    carousels: [{ type: 'popup' }]
  });
  assert.equal(list.length, 1);
  assert.equal(list[0].carousel.type, 'product');
});

test('buildItemEventName', () => {
  assert.equal(buildItemEventName(''), 'click_embedded_itemA');
  assert.equal(buildItemEventName('bhv'), 'bhv_click_embedded_itemA');
});

test('resolveRecommendApiUrl', () => {
  assert.match(
    resolveRecommendApiUrl({ brand: 'DES', carouselType: 'popup' }),
    /HTTP_pidinfo_cdp_product_recommendation/
  );
  assert.match(
    resolveRecommendApiUrl({ brand: 'DABE', carouselType: 'product' }),
    /HTTP_stock_cdp_product_recommendation/
  );
  assert.match(
    resolveRecommendApiUrl({ brand: 'DES', carouselType: 'product' }),
    /HTTP_inf_alpha_bhv_cdp_product_recommendation/
  );
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `node --test scripts/widget-pure.test.mjs`  
Expected: FAIL（模組不存在或函式未匯出）

- [ ] **Step 3: 實作骨架 `inf-product-carousel-widget.js`**

檔案開頭必須是 ESM；實作上述四個 export，以及：

```js
export function assertMountConfig(config) {
  if (!config || (config.carousel == null && !Array.isArray(config.carousels))) {
    throw new Error('InfFitsProductCarousel.mount：必須提供 carousel 或 carousels');
  }
}

export function expandMountConfigs(config) {
  assertMountConfig(config);
  const { brand, GA4Key } = config;
  if (config.carousel != null) {
    return [{ brand, GA4Key, carousel: config.carousel }];
  }
  return config.carousels.map((carousel) => ({ brand, GA4Key, carousel }));
}

export function buildItemEventName(eventRecom, testSuffix = 'A') {
  const prefix = eventRecom ? `${eventRecom}_` : '';
  return `${prefix}click_embedded_item${testSuffix}`;
}

export function resolveRecommendApiUrl({ brand, carouselType, series_in, series_out }) {
  if (carouselType === 'popup') {
    return 'https://api.inffits.com/HTTP_pidinfo_cdp_product_recommendation/extension/recom_product';
  }
  const hasSeries = !!(series_in || series_out);
  const path =
    String(brand || '').toLocaleUpperCase() === 'DABE' || hasSeries
      ? 'HTTP_stock_cdp_product_recommendation'
      : 'HTTP_inf_alpha_bhv_cdp_product_recommendation';
  return `https://api.inffits.com/${path}/extension/recom_product`;
}

function mount(config) {
  const instances = expandMountConfigs(config);
  // Task 1：先回傳展開結果；後續任務改為建立 custom element
  return instances;
}

window.InfFitsProductCarousel = {
  ...(window.InfFitsProductCarousel || {}),
  mount
};
```

推薦 URL 規則必須與舊檔 `executeFetchRecommendations` 一致（約 L2297–2329）。

- [ ] **Step 4: 跑測試確認通過**

Run: `node --test scripts/widget-pure.test.mjs`  
Expected: 全部 PASS

- [ ] **Step 5: 確認舊檔未改**

Run: `git diff -- inf-product-carousel-component.js`  
Expected: 空輸出

- [ ] **Step 6: Commit**

```bash
git add inf-product-carousel-widget.js scripts/widget-pure.test.mjs
git commit -m "feat: scaffold product carousel widget mount helpers"
```

---

### Task 2: Custom element 註冊與 mount 建立實例

**Files:**
- Modify: `inf-product-carousel-widget.js`
- Create: `demo-widget.html`（最小殼，可先不呼叫 API）

**Interfaces:**
- Consumes: `expandMountConfigs`
- Produces:
  - `class InfProductCarouselWidget extends HTMLElement`
  - `customElements.define('inf-product-carousel-widget', ...)`（僅定義一次）
  - `mount(config)` → `HTMLElement | HTMLElement[]`
  - instance key：`inf-widget-carousel-${type}-${containerId}`
  - attribute：`config`（JSON）、`data-instance-key`

- [ ] **Step 1: 實作 CE 空殼**

對齊舊檔模式（只讀參考 `inf-product-carousel-component.js` L1–21、L3121–3168），但：

- class 名：`InfProductCarouselWidget`
- tag：`inf-product-carousel-widget`
- `observedAttributes`: `['config']`
- `attributeChangedCallback`：parse config 後呼叫 `this.bootstrap(config)`（Task 2 的 bootstrap 可只 `console.debug` 或建立空 shadow 容器）

`mount`：

```js
function createInstance(instanceConfig) {
  const carouselType = instanceConfig?.carousel?.type || 'product';
  const containerId =
    instanceConfig?.carousel?.showPositionId?.top ||
    instanceConfig?.carousel?.showPositionId?.bottom ||
    'default';
  const instanceKey = `inf-widget-carousel-${carouselType}-${containerId}`;
  const existing = document.querySelector(
    `inf-product-carousel-widget[data-instance-key="${instanceKey}"]`
  );
  if (existing) return existing;

  const el = document.createElement('inf-product-carousel-widget');
  el.setAttribute('data-instance-key', instanceKey);
  el.setAttribute('config', JSON.stringify(instanceConfig));
  document.body.appendChild(el);
  return el;
}

function mount(config) {
  const list = expandMountConfigs(config).map(createInstance);
  return list.length === 1 ? list[0] : list;
}
```

注意：瀏覽器環境才 `customElements.define`；Node 跑純測試時需 guard：

```js
if (typeof window !== 'undefined' && window.customElements) {
  if (!customElements.get('inf-product-carousel-widget')) {
    customElements.define('inf-product-carousel-widget', InfProductCarouselWidget);
  }
  window.InfFitsProductCarousel = { ...(window.InfFitsProductCarousel || {}), mount };
}
```

確保 Node `import` 測試仍可跑（不要在 top-level 存取不存在的 `document`）。

- [ ] **Step 2: 建立最小 `demo-widget.html`**

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Product Carousel Widget Demo</title>
</head>
<body>
  <div id="infFitsHeader"></div>
  <div id="infFitsContent"><p>demo-widget</p></div>
  <div id="infFitsFooter"></div>
  <script type="module">
    await import('./inf-product-carousel-widget.js');
    window.InfFitsProductCarousel.mount({
      brand: 'DES',
      GA4Key: 'G-G3WD6KWQG4',
      carousels: [
        { type: 'product', showPositionId: { top: 'infFitsHeader', bottom: 'infFitsFooter' } }
      ]
    });
    console.log('mounted', document.querySelectorAll('inf-product-carousel-widget').length);
  </script>
</body>
</html>
```

- [ ] **Step 3: 語法與單元測試**

Run:

```bash
node --check inf-product-carousel-widget.js
node --test scripts/widget-pure.test.mjs
```

Expected: 無語法錯；純測試 PASS

- [ ] **Step 4: 瀏覽器煙霧測試**

Run: `python3 -m http.server 8767`（於 repo root）  
Open: `http://127.0.0.1:8767/demo-widget.html`  
Expected: DOM 出現至少一個 `inf-product-carousel-widget`；console 無未捕捉錯誤（尚可不顯示輪播內容）

- [ ] **Step 5: 確認舊檔未改 + Commit**

```bash
git diff -- inf-product-carousel-component.js
git add inf-product-carousel-widget.js demo-widget.html
git commit -m "feat: register inf-product-carousel-widget and mount instances"
```

---

### Task 3: Brand config + 容器定位（對齊舊 init）

**Files:**
- Modify: `inf-product-carousel-widget.js`

**Interfaces:**
- Consumes: mount 寫入的 `config` attribute
- Produces:
  - `bootstrap(config)` → 拉 brandConfig（product）或使用 `carousel.brandConfig`
  - `convertBrandConfig(brandConfig, config)`（邏輯對齊舊檔 L459+）
  - 依 `Location` + `showPositionId` 把元件移到 `#infFitsHeader` / `#infFitsFooter` 等

- [ ] **Step 1: 從舊檔移植 brand 流程（改寫進新 class，勿 import 舊檔）**

對齊：

- API：`POST https://api.inffits.com/mkt_brand_config_proc/GetItems` body `{ Brand: brand }`
- 僅 `carousel.type === 'product'` 打 API；popup 用傳入的 `brandConfig`
- 取 `Module === 'Product_Carousel_Widget'` 的 `ConfigData.Section_Info[0]`
- `carousel.brandConfig` 優先於 API
- `brandConfig.status === false` → 不繼續初始化（對齊舊行為）

- [ ] **Step 2: 合併 config 後建立內部容器結構**

在 shadowRoot 內建立與舊版相容的掛載點 id（`infFitsHeader` / `infFitsFooter` / popup 容器），並將 host 移到頁面 `showPositionId` 目標（對齊舊 `initProductRecommendation(..., true)` 移動行為）。

- [ ] **Step 3: 用 demo-widget 驗證**

Open demo-widget；Network 應出現 `mkt_brand_config_proc/GetItems`（product）。  
Expected: 請求成功或有明確錯誤 log；host 被移到 footer/header 之一。

- [ ] **Step 4: 舊檔未改 + Commit**

```bash
git diff -- inf-product-carousel-component.js
git add inf-product-carousel-widget.js
git commit -m "feat: port brand config and placement into widget"
```

---

### Task 4: SKU／會員解析

**Files:**
- Modify: `inf-product-carousel-widget.js`

**Interfaces:**
- Produces（方法名可與舊檔對齊，便於對照）:
  - `getDefaultSkuContent()`
  - `shopline_sku()` / `app91_sku()`
  - `ids_init(skuContentType)`
  - 最終 `skuContentValue` 規則：非 `app91_sku`/`shopline_sku` 的字串視為直接 PID

- [ ] **Step 1: 移植 SKU／ids 邏輯**

只讀舊檔約 L700–810、ids_init 相關區段，改寫進新 class。行為必須一致。

- [ ] **Step 2: 在 bootstrap 後印出除錯資訊（暫時）**

```js
// 開發期可留；Task 結束前改為僅在需要時使用，避免 demo 洗版
console.debug('[widget] ids', ids);
```

- [ ] **Step 3: 單元測試仍綠 + 舊檔未改**

```bash
node --test scripts/widget-pure.test.mjs
git diff -- inf-product-carousel-component.js
```

- [ ] **Step 4: Commit**

```bash
git add inf-product-carousel-widget.js
git commit -m "feat: port sku and member id resolution into widget"
```

---

### Task 5: 渲染殼層（CSS + Swiper DOM + 依賴載入）

**Files:**
- Modify: `inf-product-carousel-widget.js`

**Interfaces:**
- Produces:
  - `ensureJQueryLoaded` / `ensureSwiperLoaded`（對齊舊檔動態載入）
  - `loadEmbeddedScript(containerId, mergedConfig)`：注入與舊版相同結構的 `.infEmbeddedAdContainer`、`.a-left` / `.a-right`、`.title-nav-*`、`#swiper-wrapper-basic-${containerId}`
  - resize 時箭頭 vs title-nav 顯示規則（≥768 + arrowPosition center）

- [ ] **Step 1: 移植樣式與 DOM 模板**

從舊檔 `loadEmbeddedScript`（約 L1020–1700）改寫；選擇器／class 名稱保持相容（GA4 category 仍用 `infEmbeddedAdContainer-embedded`）。

- [ ] **Step 2: 尚未接推薦時可先放空 wrapper**

頁面應能看到標題區殼層（即使無商品）。

- [ ] **Step 3: demo 驗證**

Expected: Swiper／jQuery 腳本被載入；shadow 內有 `.infEmbeddedAdContainer`。

- [ ] **Step 4: Commit**

```bash
git add inf-product-carousel-widget.js
git commit -m "feat: port carousel shell markup styles and swiper loader"
```

---

### Task 6: 推薦 API + 商品卡片渲染

**Files:**
- Modify: `inf-product-carousel-widget.js`

**Interfaces:**
- Consumes: `resolveRecommendApiUrl`
- Produces:
  - `showLoadingAndLoadAds` / `fetchRecommendations` / `executeFetchRecommendations`
  - 快取 key／TTL 行為對齊舊檔
  - `customEdm` 優先於 API
  - 商品 DOM：`data-title` / `data-link` / `data-event-recom` / `data-pid`
  - SIZEAI size_tag、displayMode／recommendMode 篩選對齊舊檔

- [ ] **Step 1: 移植 fetch + render slides**

只讀舊檔約 L1899–3000；改寫進新檔。API URL 必須呼叫 Task 1 的 `resolveRecommendApiUrl`（避免複製時再分叉）。

- [ ] **Step 2: demo-widget 驗證商品出現**

Expected: product 輪播出現多張 `.embeddedItem`；點擊連結屬性齊全。

- [ ] **Step 3: 純測試仍 PASS + 舊檔未改 + Commit**

```bash
node --test scripts/widget-pure.test.mjs
git diff -- inf-product-carousel-component.js
git add inf-product-carousel-widget.js
git commit -m "feat: port recommendation fetch and item rendering"
```

---

### Task 7: Popup 全流程

**Files:**
- Modify: `inf-product-carousel-widget.js`
- Modify: `demo-widget.html`（補上 popup carousel，對齊 `demo.html`）

**Interfaces:**
- Produces:
  - `handlePopup(autoShow)`
  - `#infPopupproductCarousel`（注意：若舊 id 全域唯一，新檔同 id 以便行為對齊；同頁勿同時掛舊+新 popup，demo 只掛新檔）
  - `window.showPopup` / `closePopup` / `resetRecom`
  - `popup-reload-recommendations` 自訂事件（對齊舊檔）

- [ ] **Step 1: 移植 popup UI 與 API**

只讀舊檔 `handlePopup`（約 L24–380）改寫。

- [ ] **Step 2: 更新 `demo-widget.html` 為完整兩段 carousels**

對齊 `demo.html` 的 popup + product config（含 bid / brandConfig），但改為：

```js
await import('./inf-product-carousel-widget.js');
window.InfFitsProductCarousel.mount({ brand, GA4Key, carousels });
```

- [ ] **Step 3: 驗證**

Expected: 左下角 popup 可顯示；`showPopup`／`closePopup` 可用；product 仍在頁面容器。

- [ ] **Step 4: Commit**

```bash
git add inf-product-carousel-widget.js demo-widget.html
git commit -m "feat: port popup carousel flow into widget"
```

---

### Task 8: GA4 + recordMktClick（乾淨單一路徑）

**Files:**
- Modify: `inf-product-carousel-widget.js`
- Modify: `scripts/widget-pure.test.mjs`（補事件名案例即可）

**Interfaces:**
- Consumes: `buildItemEventName`
- Produces:
  - `ensureGtagLoaded(GA4Key)`
  - `sendGAEvent(eventName, eventData)`（自動 `send_to`；無 GA4Key 直接 return）
  - 單一 `shadowRoot` click 委派（對齊已修正的乾淨版；**不要**複製舊檔重複 jQuery gtag 綁定）
  - `recordMktClick` → `POST https://api.inffits.com/mkt_click_action_record/`

事件規格（必須）：

| 行為 | 事件名 | category | label | value |
|------|--------|----------|-------|-------|
| 商品 | `buildItemEventName(recom)` | `infEmbeddedAdContainer-embedded` | `Title: {title}` | link.length |
| 左箭 | `click_embedded_item_arrow_leftA` | 同上 | `arrow-left` | 10 |
| 右箭 | `click_embedded_item_arrow_rightA` | 同上 | `arrow-right` | 10 |
| title prev | `click_embedded_item_title_nav_prevA` | 同上 | `title-nav-prev` | 10 |
| title next | `click_embedded_item_title_nav_nextA` | 同上 | `title-nav-next` | 10 |

- [ ] **Step 1: 實作 sendGAEvent + 單一 click 委派 + recordMktClick**

- [ ] **Step 2: 瀏覽器攔截驗證**

在 console：

```js
window.__ga = [];
const o = window.gtag;
window.gtag = function(){ if(arguments[0]==='event') window.__ga.push(arguments[1]); return o?.apply(this, arguments); };
// 點一張商品後：
window.__ga
```

Expected: 陣列長度 1，名稱為 `corr_click_embedded_itemA` 或 `bhv_click_embedded_itemA` 等正確名（依 data-event-recom）。

- [ ] **Step 3: Commit**

```bash
git add inf-product-carousel-widget.js scripts/widget-pure.test.mjs
git commit -m "feat: add clean GA4 and recordMktClick to widget"
```

---

### Task 9: 快取清理與全域輔助對齊

**Files:**
- Modify: `inf-product-carousel-widget.js`

**Interfaces:**
- Produces:
  - `cleanupExpiredCache` / `window.cleanupInfCarouselCache`（對齊舊行為；快取 key 前綴可沿用或使用 `inf_widget_carousel_cache_`——若沿用舊前綴需在註解說明共用風險；**建議新前綴** `inf_widget_carousel_cache_` 避免與舊組件互清）
  - `window.debugCarousel` 針對新 tag

- [ ] **Step 1: 移植快取清理；採用 `inf_widget_carousel_cache_` 前綴**

推薦讀寫快取也必須用同一前綴。

- [ ] **Step 2: 驗證舊檔未改 + Commit**

```bash
git diff -- inf-product-carousel-component.js
git add inf-product-carousel-widget.js
git commit -m "feat: add widget recommendation cache cleanup helpers"
```

---

### Task 10: 對等驗收與文件鉤子

**Files:**
- Modify: `demo-widget.html`（確保與 `demo.html` 設定對等）
- Create（可選短文）: `WIDGET.md` — 僅兩行用法 + 連到 USAGE／GA4（若不想加檔，改在本任務只更新 plan 驗收紀錄亦可；**優先加 `WIDGET.md` 方便使用**）

**驗收清單（全部打勾才算完成）：**

- [ ] **Step 1: 舊檔零差異**

```bash
git diff -- inf-product-carousel-component.js
git hash-object inf-product-carousel-component.js
```

Expected: diff 空；hash 與任務開始時相同（實作開始時先記錄 hash）。

- [ ] **Step 2: 單元測試**

```bash
node --test scripts/widget-pure.test.mjs
```

Expected: PASS

- [ ] **Step 3: demo-widget 功能對等**

| 檢查 | Expected |
|------|----------|
| 兩行 import + mount | 可掛載 |
| product 商品列 | 有資料 |
| popup | 可開關 |
| 點商品 GA4 | 一筆正確事件名 |
| 點箭頭／title-nav | 一筆對應事件 |
| Network recordMktClick | 僅商品點擊 |

- [ ] **Step 4: 寫 `WIDGET.md` 最短使用說明**

```markdown
# InfFits Product Carousel Widget

```js
await import('https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js');
window.InfFitsProductCarousel.mount({ brand: 'DES', GA4Key: 'G-xxx', carousels: [/* 同 USAGE.md */] });
```

參數見 [USAGE.md](./USAGE.md)，GA4 見 [GA4.md](./GA4.md)。
舊版 `inf-product-carousel-component.js` 仍可用，互不依賴。
```

- [ ] **Step 5: Commit**

```bash
git add demo-widget.html WIDGET.md
git commit -m "docs: add widget usage demo and short guide"
```

---

## Spec Coverage Checklist

| 規格要求 | 對應 Task |
|----------|-----------|
| 獨立 ESM、兩行 API | 1–2 |
| 不改舊檔、不 wrapper | Global + 每任務 git diff |
| mount + carousels 一次掛多個 | 1–2 |
| brandConfig / 定位 | 3 |
| sku | 4 |
| 渲染／Swiper | 5 |
| 推薦 API 全模式 | 6 |
| popup + show/close/reset | 7 |
| GA4 乾淨 + recordMktClick | 8 |
| 快取 | 9 |
| demo-widget + 成功標準 | 10 |

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-17-product-carousel-widget.md`.

**兩種執行方式：**

1. **Subagent-Driven（建議）** — 每任務派一個新 subagent，任務間審查  
2. **Inline Execution** — 本會話依 executing-plans 連續做，設檢查點  

要走哪一種？
