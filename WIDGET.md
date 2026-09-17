# InfFits Product Carousel Widget

ESM 商品推薦輪播。與舊版 `inf-product-carousel-component.js` **互不依賴**（tag 為 `<inf-product-carousel-widget>`，可同頁並存）。

| 項目 | 說明 |
|------|------|
| 腳本 | `inf-product-carousel-widget.js` |
| 入口 | `window.InfFitsProductCarousel.mount(config)` |
| Custom Element | `<inf-product-carousel-widget>` |
| 渲染 | Shadow DOM |
| 依賴 | 執行期自行載入 jQuery、Swiper；有 `GA4Key` 時載入 gtag |

支援兩種輪播，可一次 `mount` 同時掛上：

| `carousel.type` | 說明 |
|-----------------|------|
| `product` | 嵌入頁面指定容器 |
| `popup` | 左下角浮動彈窗 |

---

## 1. 兩行用法

```js
await import('https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js');

window.InfFitsProductCarousel.mount({
  brand: 'DES',
  GA4Key: 'G-XXXXXXXXXX',
  carousels: [
    {
      type: 'popup',
      showPositionId: { bottom: 'popupProductContent' },
      brandConfig: {
        DisplayMode: 'SaleRate',
        CarouselButton: true,
        RecommendMode: 'bhv',
        CarouselLayout: 2.5,
        Title: '您可能會喜歡',
        Location: 'bottom',
        status: true
      }
    },
    {
      type: 'product',
      showPositionId: {
        top: 'infFitsHeader',
        bottom: 'infFitsFooter'
      }
    }
  ]
});
```

本機相對路徑亦可：`await import('./inf-product-carousel-widget.js')`。

頁面需先有掛載用容器（`id` 與 `showPositionId` 一致）：

```html
<div id="infFitsHeader"></div>
<div id="infFitsContent"><!-- 主內容 --></div>
<div id="infFitsFooter"></div>
```

---

## 2. `mount` 行為

1. **必須**提供 `carousel` 或 `carousels`，否則 `throw`。
2. 有 `carousel` 時只初始化該筆（即使也有 `carousels`）。
3. 僅有 `carousels` 時展開為多個實例。
4. 依 `type` + `showPositionId` 產生 `data-instance-key`，相同 key 不重複建立。
5. 建立 `<inf-product-carousel-widget>`，寫入 `config` attribute，先 append 到 `body`，再依品牌 `Location` 移到目標容器。

回傳值：單一實例為 Custom Element；多個為陣列。

---

## 3. 設定結構

```js
{
  brand: string,       // 品牌代碼
  GA4Key: string,      // GA4 Measurement ID；不傳或 '' 則不追蹤
  carousel: { ... },   // 單筆；有值時優先
  carousels: [ ... ]   // 多筆；未傳 carousel 時展開
}
```

---

## 4. 頂層參數

| 參數 | 型別 | 說明 |
|------|------|------|
| `brand` | `string` | 品牌代碼，用於品牌設定 API 與推薦 API |
| `GA4Key` | `string` | GA4 Measurement ID；空則不載入 gtag、不發事件 |
| `carousel` | `object` | 單一輪播 |
| `carousels` | `object[]` | 多個輪播；與 `carousel` 二擇一使用（`carousel` 優先） |

---

## 5. `carousel` 參數

| 參數 | 型別 | 說明 |
|------|------|------|
| `type` | `'product'` \| `'popup'` | 輪播型態；未傳時依流程視為 `product` |
| `showPositionId` | `{ top?, bottom? }` | 掛載容器 DOM `id`。常見：`{ top: 'infFitsHeader', bottom: 'infFitsFooter' }`；popup 常用 `{ bottom: 'popupProductContent' }` |
| `hide_size` | `boolean` | 隱藏尺寸相關資訊 |
| `hide_discount` | `boolean` | 隱藏折扣價 |
| `backgroundColor` | `string` | 輪播區塊背景色 |
| `skuContent` | `string` | 商品 SKU 來源（見第 6 節） |
| `series_in` | `string` | 系列白名單，JSON 字串，例如 `'["女"]'` |
| `series_out` | `string` | 系列黑名單，JSON 字串 |
| `bid` | `object` | 體型／試穿參數，影響 SIZEAI 尺寸推薦 |
| `brandConfig` | `object` | 覆寫後端品牌設定（見第 7 節） |
| `customEdm` | `array` | 自訂商品列表；有值時優先於 API 推薦 |
| `title` | `string` | 標題（常被 `brandConfig.Title` 覆寫） |
| `description` | `string` | 描述 |
| `displayMode` | `string` | 資料取用：`SaleRate` / `SocialProofNum` 等 |
| `recommendMode` | `string` | 推薦來源，逗號分隔，例如 `'bhv,corr,sp_atc,sp_trans'` |
| `arrowPosition` | `'center'` \| `'none'` | 箭頭；`none` 時改用標題旁導覽 |
| `autoplay` | `boolean` | 是否自動輪播 |
| `customPadding` | `any` | 自訂內距 |
| `breakpoints` | `object` | Swiper 斷點 |
| `ctype_val` | `array` | 類型篩選值 |

### `showPositionId` 與 Location

- 品牌設定 `Location === 'top'` → 掛到 `showPositionId.top`
- `Location === 'bottom'` → 掛到 `showPositionId.bottom`
- `type === 'popup'` 時內容掛在彈窗內的 `popupProductContent`

### `type: 'product'`

- 呼叫 `POST https://api.inffits.com/mkt_brand_config_proc/GetItems`（`{ Brand }`），取 `Module === 'Product_Carousel_Widget'`。
- 若有 `carousel.brandConfig`，**優先本地**，不依賴 API。
- 推薦 endpoint：
  - 品牌 `DABE`，或有 `series_in` / `series_out` → `HTTP_stock_cdp_product_recommendation`
  - 其餘 → `HTTP_inf_alpha_bhv_cdp_product_recommendation`
  - 完整 URL：`https://api.inffits.com/{上列}/extension/recom_product`

### `type: 'popup'`

- 建立左下角浮動層 `#infPopupproductCarousel`。
- 需 `brandConfig.status === true` 才啟用。
- `brandConfig.autoShow`：
  - `true`：資料載入後自動顯示
  - `false`：需手動 `window.showPopup()`
- 推薦 endpoint：`https://api.inffits.com/HTTP_pidinfo_cdp_product_recommendation/extension/recom_product`

---

## 6. `skuContent`（商品識別）

供推薦 API 判斷目前頁面商品。

| 值 | 行為 |
|----|------|
| `'shopline_sku'` | 從頁面解析 Shopline SKU |
| `'app91_sku'` | 從 91APP 頁面解析 SKU |
| 其他字串 | 視為直接指定的 PID／SKU，不再自動解析 |
| 未傳 | 依網域／頁面結構自動判斷 |

會員 ID 會依類型從 `dataLayer` 或頁面 HTML 解析。

---

## 7. `brandConfig`

可由 API 取得，或初始化時傳入覆寫。

| 欄位 | 對應內部 | 說明 |
|------|----------|------|
| `Title` | `title` | 輪播標題 |
| `Description` | `description` | 描述 |
| `DisplayMode` | `displayMode` | 如 `SaleRate`、`SocialProofNum` |
| `RecommendMode` | `recommendMode` | 如 `bhv`、`bhv,corr` |
| `CarouselButton` | `arrowPosition` | `true` → `center`；`false` → `none` |
| `CarouselLayout` | 桌面 `slidesPerView` | 數字 |
| `Location` | 掛載上下 | `'top'` / `'bottom'` |
| `status` | 是否啟用 | `false` 時不初始化 |
| `autoShow` | popup 自動顯示 | 僅 popup |

```js
brandConfig: {
  DisplayMode: 'SaleRate',
  CarouselButton: true,
  RecommendMode: 'bhv',
  CarouselLayout: 2.5,
  Title: '您可能會喜歡',
  Location: 'bottom',
  status: true,
  autoShow: true
}
```

---

## 8. 顯示模式與推薦來源

### `displayMode`

| 值 | 行為概要 |
|----|----------|
| `SaleRate` | 優先 `bhv` / `corr`，沒有才用 `sp_atc` / `sp_trans` |
| `SocialProofNum` | 只用 `sp_atc` / `sp_trans` |

實際取用仍受 `recommendMode` 限制。

### `recommendMode` 常見值

| 值 | 意義 |
|----|------|
| `bhv` | 行為推薦 |
| `corr` | 關聯推薦 |
| `sp_atc` | Social Proof（加入購物車） |
| `sp_trans` | Social Proof（成交） |
| `bhv,corr,sp_atc,sp_trans` | 組合 |

商品卡片會帶 `data-event-recom`，供 GA4 事件名前綴使用。

---

## 9. Popup 全域 API

掛上 `type: 'popup'` 且 `status: true` 後可用：

| API | 說明 |
|-----|------|
| `window.showPopup()` | 顯示彈窗；`autoShow === false` 時會先觸發載入 |
| `window.closePopup()` | 關閉彈窗 |
| `window.resetRecom(newBid?)` | 重新拉取推薦；可傳新 `bid` 覆寫體型參數 |

```js
window.resetRecom({
  HV: '25.5',
  WV: '0',
  Gender: 'F',
  Brand: 'CLARKS'
  // ...其餘 bid 欄位
});
window.showPopup();
```

相關狀態（除錯用）：`window.popupautoShow`、`window.hasValidPopupData`、`window.resetRecomCalled`。

---

## 10. 其他全域輔助

| API | 說明 |
|-----|------|
| `window.debugCarousel()` | 強制顯示目前實例 Shadow DOM 內輪播容器 |
| `window.cleanupInfCarouselCache()` | 清理本 widget 推薦快取（前綴 `inf_widget_carousel_cache_`，約 10 分鐘過期） |

---

## 11. GA4 事件

前提：`mount` 時與 `brand` 同層傳入非空 `GA4Key`。未傳則不載入 gtag、不發事件。

所有自訂事件經 `sendGAEvent`，附帶 `send_to: GA4Key`。每次點擊只發送 **1 次**。事件名後綴目前為 `A`。

| 使用者行為 | 事件名稱 | event_category | event_label | value |
|------------|----------|----------------|-------------|-------|
| 組件載入 gtag | `page_view` | （GA4 標準） | — | — |
| 點商品（無 recom） | `click_embedded_itemA` | `infEmbeddedAdContainer-embedded` | `Title: {標題}` | 連結字串長度 |
| 點行為推薦 | `bhv_click_embedded_itemA` | 同上 | 同上 | 同上 |
| 點關聯推薦 | `corr_click_embedded_itemA` | 同上 | 同上 | 同上 |
| 點 SP 加購 | `sp_atc_click_embedded_itemA` | 同上 | 同上 | 同上 |
| 點 SP 成交 | `sp_trans_click_embedded_itemA` | 同上 | 同上 | 同上 |
| 桌面左箭頭 | `click_embedded_item_arrow_leftA` | 同上 | `arrow-left` | `10` |
| 桌面右箭頭 | `click_embedded_item_arrow_rightA` | 同上 | `arrow-right` | `10` |
| 標題上一頁 | `click_embedded_item_title_nav_prevA` | 同上 | `title-nav-prev` | `10` |
| 標題下一頁 | `click_embedded_item_title_nav_nextA` | 同上 | `title-nav-next` | `10` |

商品事件名規則：`{event_recom}_click_embedded_itemA`（無 `event_recom` 則無前綴）。

| 條件 | 顯示的導覽 | 對應事件 |
|------|------------|----------|
| 寬度 ≥ 768 且 `arrowPosition === 'center'` | `.a-left` / `.a-right` | `arrow_leftA` / `arrow_rightA` |
| 寬度 < 768，或非 center | `.title-nav-prev` / `.title-nav-next` | `title_nav_prevA` / `title_nav_nextA` |

箭頭／標題導覽**不會**打後端點擊 API。

查詢建議：GA4 DebugView 確認 `send_to`；點一次商品／箭頭應各只有一筆事件。

---

## 12. 後端點擊紀錄（非 GA4）

僅「點擊商品」另 POST `https://api.inffits.com/mkt_click_action_record/`，與 GA4 並行。

| 欄位 | 說明 |
|------|------|
| `Brand` | 品牌 |
| `GVID` / `LGVID` / `MRID` | 訪客／會員相關 ID |
| `recom_type` | 同 `data-event-recom` |
| `recom_loc` | `popup` 或 `embed` |
| `action` | `click` |
| `action_link` / `action_itemname` / `action_pid` | 連結、名稱、PID |

---

## 13. 自訂商品 `customEdm`

非空陣列時略過 API 推薦，直接渲染。建議欄位：

```js
customEdm: [
  {
    title: '商品名稱',
    link: 'https://...',
    // 價格、圖片、pid 等依渲染需求
    event_recom: 'bhv'
  }
]
```

---

## 14. 完整範例

### 僅嵌入式 product

```js
await import('https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js');

window.InfFitsProductCarousel.mount({
  brand: 'DES',
  GA4Key: 'G-G3WD6KWQG4',
  carousel: {
    type: 'product',
    hide_size: true,
    showPositionId: {
      top: 'infFitsHeader',
      bottom: 'infFitsFooter'
    }
  }
});
```

### product + popup（一次 mount）

```js
await import('https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js');

window.InfFitsProductCarousel.mount({
  brand: 'DES',
  GA4Key: 'G-G3WD6KWQG4',
  carousels: [
    {
      type: 'popup',
      hide_size: false,
      showPositionId: { bottom: 'popupProductContent' },
      bid: {
        HV: '25.5',
        WV: '0',
        Brand: 'CLARKS',
        Gender: 'F',
        GVID: 'INF',
        LGVID: 'INF',
        MRID: 'INF',
        SHOES_MODE: '1',
        FOOT_CIRCUM: '20',
        CALF_CIRCUM: '30.4'
        // ...其餘試穿欄位依需求
      },
      brandConfig: {
        DisplayMode: 'SaleRate',
        CarouselButton: true,
        RecommendMode: 'bhv',
        CarouselLayout: 2.5,
        Title: '您可能會喜歡',
        Location: 'bottom',
        status: true,
        autoShow: true
      }
    },
    {
      type: 'product',
      showPositionId: {
        top: 'infFitsHeader',
        bottom: 'infFitsFooter'
      }
    }
  ]
});
```

### 系列篩選

```js
window.InfFitsProductCarousel.mount({
  brand: 'DES',
  GA4Key: 'G-G3WD6KWQG4',
  carousel: {
    type: 'product',
    series_in: '["女"]',
    hide_size: true,
    showPositionId: {
      top: 'infFitsHeader',
      bottom: 'infFitsFooter'
    }
  }
});
```

---

## 15. 常見問題

**畫面沒有輪播？**  
確認 `showPositionId` 對應的 DOM `id` 已存在；`brandConfig.status` 不是 `false`；popup 若 `autoShow: false` 需呼叫 `showPopup()`；`hasValidPopupData === false` 時彈窗不會顯示。

**重複 mount 沒新建？**  
相同 `type` + `showPositionId` 會回傳既有實例。

**如何關閉追蹤？**  
不傳 `GA4Key`，或傳空字串。

**如何強制指定目前商品？**  
設 `carousel.skuContent` 為實際 PID／SKU 字串。

**缺參數會怎樣？**  
未提供 `carousel`，或 `carousels` 為空／非陣列時會拋錯（例如：`必須提供 carousel 或非空的 carousels`）。

---

## 16. 測試

```bash
npm test
```

涵蓋：`mount` 參數驗證、推薦 URL、brandConfig 轉換、推薦資料有效性、快取 key、GA4／後端點擊 payload、導覽模式、debounce、模組 export 完整性。  
目前為 Node 純函式／契約測試（不需瀏覽器）。視覺與整合可用本機 `demo-widget.html` 手動驗證。

---

## 17. 簡報（PPT 講解）

| 檔案 | 用途 |
|------|------|
| `docs/InfFits-Product-Carousel-Widget-簡報.pptx` | PowerPoint，可下載投影 |
| `docs/WIDGET-slides.html` | 瀏覽器全螢幕簡報（←→／空白鍵翻頁，F 全螢幕） |

內容對齊本文件：兩行用法、product／popup、參數、GA4、FAQ。
