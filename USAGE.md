# Product Carousel 組件 — 使用說明

本文件說明如何在頁面中引入並設定 `inf-product-carousel-component.js`（infFITS 產品推薦輪播 Web Component）。

GA4 事件細節請另見 [GA4.md](./GA4.md)。

---

## 1. 簡介

| 項目 | 說明 |
|------|------|
| 類型 | Custom Element（Web Component） |
| 標籤名 | `<inf-product-carousel-component>` |
| 初始化入口 | `window.initInfProductCarouselComponent(config)` |
| 渲染方式 | Shadow DOM |
| 依賴 | 組件會自行載入 jQuery、Swiper、gtag（若有設定 `GA4Key`） |

支援兩種輪播型態：

| `carousel.type` | 說明 |
|-----------------|------|
| `product` | 嵌入頁面指定容器的推薦輪播 |
| `popup` | 左下角浮動彈窗推薦 |

---

## 2. 快速開始

### 2.1 準備放置容器

頁面需有對應的 DOM 節點供組件掛載（`id` 需與 `showPositionId` 一致）：

```html
<div id="infFitsHeader"></div>
<div id="infFitsContent"><!-- 頁面主內容 --></div>
<div id="infFitsFooter"></div>
```

### 2.2 載入腳本並初始化

```html
<script src="./inf-product-carousel-component.js"></script>
<script>
  window.initInfProductCarouselComponent({
    brand: 'DES',
    GA4Key: 'G-XXXXXXXXXX', // 選填；不傳則不追蹤
    carousel: {
      type: 'product',
      showPositionId: {
        top: 'infFitsHeader',
        bottom: 'infFitsFooter'
      }
    }
  });
</script>
```

多個輪播直接傳 `carousels`，不必自行 `forEach`：

```javascript
window.initInfProductCarouselComponent({
  brand: 'DES',
  GA4Key: 'G-G3WD6KWQG4',
  carousels: [
    { type: 'popup', showPositionId: { bottom: 'popupProductContent' } },
    { type: 'product', showPositionId: { top: 'infFitsHeader', bottom: 'infFitsFooter' } }
  ]
});
```

舊寫法（`forEach` + 單筆 `carousel`）仍完全相容：

```javascript
config.carousels.forEach(carousel => {
  window.initInfProductCarouselComponent({
    brand: config.brand,
    GA4Key: config.GA4Key,
    carousel
  });
});
```

### 2.3 初始化行為說明

`initInfProductCarouselComponent` 會：

1. 依 `carousel.type` + `showPositionId` 產生唯一 `data-instance-key`，避免重複建立相同實例。
2. 建立 `<inf-product-carousel-component>`，將 `config` 寫入 `config` attribute（JSON）。
3. 先 append 到 `document.body`，之後依品牌設定的 `Location` 自動移到目標容器。
4. 若傳入 `carousels` 陣列且**沒有**單筆 `carousel`，會在函式內展開為多次初始化。
5. 若已帶 `carousel`（舊寫法），即使物件上還有 `carousels` 也只初始化該筆，避免與既有 `forEach` 衝突。

回傳值：單一輪播為 Custom Element 實例；多個輪播為實例陣列。

---

## 3. 設定結構

傳入函式的物件結構為：

```javascript
{
  brand: string,      // 必填：品牌代碼
  GA4Key: string,     // 選填：GA4 Measurement ID
  carousel: { ... },  // 舊寫法：單筆；有值時優先，不展開 carousels
  carousels: [ ... ]  // 新寫法：多筆；未傳 carousel 時由組件展開
}
```

---

## 4. 頂層參數

| 參數 | 型別 | 預設 | 說明 |
|------|------|------|------|
| `brand` | `string` | `'JERSCY'` | 品牌代碼，用於品牌設定 API 與推薦 API |
| `GA4Key` | `string` | `''` | GA4 Measurement ID；空字串則不載入／不發送 GA 事件 |
| `carousel` | `object` | — | 單一輪播設定（舊寫法）；有值時優先，不展開 `carousels` |
| `carousels` | `object[]` | — | 多個輪播；僅在未傳 `carousel` 時由組件展開 |

---

## 5. `carousel` 參數

### 5.1 通用

| 參數 | 型別 | 預設 | 說明 |
|------|------|------|------|
| `type` | `'product'` \| `'popup'` | `'product'`（初始化推導） | 輪播型態 |
| `showPositionId` | `{ top?, bottom? }` | 見下方 | 掛載容器的 DOM `id` |
| `hide_size` | `boolean` | `false` | 是否隱藏尺寸相關資訊 |
| `hide_discount` | `boolean` | `false` | 是否隱藏折扣價 |
| `backgroundColor` | `string` | `'rgba(255,255,255,1)'` | 輪播區塊背景色 |
| `skuContent` | `string` | 自動判斷 | 商品 SKU 來源（見第 6 節） |
| `series_in` | `string` | — | 系列白名單（JSON 字串，例如 `'["女"]'`） |
| `series_out` | `string` | — | 系列黑名單（JSON 字串） |
| `bid` | `object` | 見程式預設 | 體型／試穿參數，影響尺寸推薦（SIZEAI） |
| `brandConfig` | `object` | — | 直接覆寫後端品牌設定（見第 7 節） |
| `customEdm` | `array` | `[]` | 自訂商品列表；有值時優先於 API 推薦結果 |
| `title` | `string` | `'推薦您也可以這樣搭配'` | 標題（通常由 `brandConfig.Title` 覆寫） |
| `description` | `string` | `''` | 描述文字 |
| `displayMode` | `string` | `'SaleRate'` | 資料取用模式：`SaleRate` / `SocialProofNum` 等 |
| `recommendMode` | `string` | `'bhv,corr,sp_atc,sp_trans'` | 推薦來源，逗號分隔 |
| `arrowPosition` | `'center'` \| `'none'` | `'center'` | 箭頭位置；`none` 時改用標題旁導覽 |
| `autoplay` | `boolean` | `true` | 是否自動輪播 |
| `customPadding` | `any` | `null` | 自訂內距 |
| `breakpoints` | `object` | 見預設 | Swiper 斷點設定 |
| `ctype_val` | `array` | `['']` | 類型篩選值 |

### 5.2 `showPositionId` 預設

若未傳入且品牌設定有 `Location`：

```javascript
{
  top: 'infFitsHeader',
  bottom: 'infFitsFooter'
}
```

- `Location === 'top'` → 掛到 `showPositionId.top`
- `Location === 'bottom'` → 掛到 `showPositionId.bottom`
- `type === 'popup'` 時，內容通常掛在彈窗內的 `popupProductContent`

### 5.3 `product` 型態注意事項

- 會呼叫品牌設定 API：`POST https://api.inffits.com/mkt_brand_config_proc/GetItems`（`{ Brand }`），並取 `Module === 'Product_Carousel_Widget'` 的設定。
- 若 `carousel.brandConfig` 有值，則**優先使用本地 brandConfig**，不依賴 API 回傳。
- 推薦 API 依品牌／是否有 `series_*` 選擇不同 endpoint（見第 9 節）。

### 5.4 `popup` 型態注意事項

- 會建立左下角浮動彈窗 `#infPopupproductCarousel`。
- 需搭配 `brandConfig.status === true` 才會啟用彈窗流程。
- `brandConfig.autoShow`：
  - `true`（預設行為）：資料載入完成後自動 `showPopup()`
  - `false`：延遲載入，需手動呼叫 `window.showPopup()` 才載入並顯示
- 推薦 API 使用 popup 專用 endpoint（見第 9 節）。

---

## 6. `skuContent`（商品識別）

決定目前頁面商品 PID／SKU，供推薦 API 使用。

| 值 | 行為 |
|----|------|
| `'shopline_sku'` | 從頁面解析 Shopline SKU（預設路徑之一） |
| `'app91_sku'` | 從 91APP 頁面解析 SKU |
| 其他字串 | 視為**直接指定的 PID／SKU 字串**，不再自動解析 |
| 未傳 | 依網域／頁面結構自動判斷（`getDefaultSkuContent()`） |

會員 ID 會依 `skuContent` 類型從 `dataLayer` 或頁面 HTML 解析（Shopline / 91APP / plain_me）。

---

## 7. `brandConfig`（品牌顯示設定）

可由後端 API 取得，或在初始化時直接傳入覆寫。組件會透過 `convertBrandConfig` 轉成內部設定：

| brandConfig 欄位 | 對應內部設定 | 說明 |
|------------------|--------------|------|
| `Title` | `title` | 輪播標題 |
| `Description` | `description` | 描述 |
| `DisplayMode` | `displayMode` | 如 `SaleRate`、`SocialProofNum` |
| `RecommendMode` | `recommendMode` | 如 `bhv`、`bhv,corr` |
| `CarouselButton` | `arrowPosition` | `true` → `center`；`false` → `none` |
| `CarouselLayout` | `breakpoints[768].slidesPerView` | 桌面可見張數（數字） |
| `Location` | `containerId` | `'top'` / `'bottom'`，搭配 `showPositionId` |
| `status` | `enabled` | `false` 時不初始化組件 |
| `autoShow` | popup 自動顯示 | 僅 popup 有意義 |

範例（popup）：

```javascript
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

## 8. 全域 API（Popup）

初始化 `type: 'popup'` 且 `status: true` 後，可使用：

| 函式 | 說明 |
|------|------|
| `window.showPopup()` | 顯示彈窗；若 `autoShow === false` 且尚未載入，會先觸發推薦載入 |
| `window.closePopup()` | 關閉彈窗 |
| `window.resetRecom(newBid?)` | 重新拉取推薦；可傳入新的 `bid` 物件覆寫體型參數 |

相關全域狀態（除錯用）：

| 變數 | 說明 |
|------|------|
| `window.popupautoShow` | 目前是否自動顯示 |
| `window.hasValidPopupData` | 推薦資料是否有效；`false` 時不會顯示彈窗 |
| `window.resetRecomCalled` | 是否剛執行過重置（影響快取與自動顯示） |

範例：試穿完成後更新推薦並開啟彈窗

```javascript
window.resetRecom({
  HV: '25.5',
  WV: '0',
  Gender: 'F',
  Brand: 'CLARKS',
  // ...其他 bid 欄位
});
window.showPopup();
```

---

## 9. 推薦 API 行為摘要

| 條件 | Endpoint |
|------|----------|
| `type === 'popup'` | `.../HTTP_pidinfo_cdp_product_recommendation/extension/recom_product` |
| `type === 'product'` 且品牌為 `DABE`，或有 `series_in` / `series_out` | `.../HTTP_stock_cdp_product_recommendation/extension/recom_product` |
| 其餘 `product` | `.../HTTP_inf_alpha_bhv_cdp_product_recommendation/extension/recom_product` |

點擊商品時另會記錄：

```
POST https://api.inffits.com/mkt_click_action_record/
```

品牌設定（僅 `product` 型態預設流程）：

```
POST https://api.inffits.com/mkt_brand_config_proc/GetItems
```

---

## 10. 顯示模式與推薦來源

### `displayMode`

| 值 | 行為概要 |
|----|----------|
| `SaleRate` | 優先 `bhv` / `corr`，沒有資料時才用 `sp_atc` / `sp_trans` |
| `SocialProofNum` | 只用 `sp_atc` / `sp_trans` |

實際取用仍受 `recommendMode`（`SIZEAI_ptr`）限制，例如只設 `'bhv'` 就不會用到其他來源。

### `recommendMode` 常見值

| 值 | 意義 |
|----|------|
| `bhv` | 行為推薦 |
| `corr` | 關聯推薦 |
| `sp_atc` | Social Proof（加入購物車） |
| `sp_trans` | Social Proof（成交） |
| `sp_atc_sp_trans` | 兩者皆可 |

可用逗號組合：`'bhv,corr,sp_atc,sp_trans'`。

商品卡片會帶 `data-event-recom`，供 GA4 事件前綴使用（詳見 [GA4.md](./GA4.md)）。

---

## 11. 自訂商品（`customEdm`）

若傳入非空陣列，會**略過 API 推薦結果**，直接用自訂資料渲染。建議欄位包含：

```javascript
customEdm: [
  {
    title: '商品名稱',
    link: 'https://...',
    // 價格、圖片、pid、event_recom 等依實際渲染需求帶入
    event_recom: 'bhv'
  }
]
```

---

## 12. 輔助全域函式

| 函式 | 說明 |
|------|------|
| `window.debugCarousel()` | 嘗試強制顯示目前實例 Shadow DOM 內的輪播容器（除錯用） |
| `window.cleanupInfCarouselCache()` | 清理 localStorage 中過期的推薦快取（前綴 `inf_carousel_cache_`，約 10 分鐘過期） |

---

## 13. 完整範例

### 嵌入式產品輪播（最簡）

```html
<div id="infFitsFooter"></div>
<script src="./inf-product-carousel-component.js"></script>
<script>
  window.initInfProductCarouselComponent({
    brand: 'DES',
    carousel: {
      type: 'product',
      showPositionId: {
        top: 'infFitsHeader',
        bottom: 'infFitsFooter'
      }
    }
  });
</script>
```

### 嵌入式 + 系列篩選 + GA4

```javascript
window.initInfProductCarouselComponent({
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

### Popup 試穿推薦

```javascript
window.initInfProductCarouselComponent({
  brand: 'DES',
  GA4Key: 'G-G3WD6KWQG4',
  carousel: {
    type: 'popup',
    hide_size: false,
    showPositionId: {
      bottom: 'popupProductContent'
    },
    bid: {
      HV: '25.5',
      WV: '0',
      Gender: 'F',
      Brand: 'CLARKS',
      GVID: 'INF',
      LGVID: 'INF',
      MRID: 'INF',
      // ...其餘試穿參數
    },
    brandConfig: {
      DisplayMode: 'SaleRate',
      CarouselButton: true,
      RecommendMode: 'bhv',
      CarouselLayout: 2.5,
      Title: '您可能會喜歡',
      Location: 'bottom',
      status: true,
      autoShow: false // 改為手動開啟
    }
  }
});

// 之後在適當時機：
// window.showPopup();
```

可直接開啟專案內的 `demo.html`、`index.html`、`test.html` 作為整合參考。

---

## 14. 常見問題

**Q：畫面沒有出現輪播？**  
- 確認 `showPositionId` 對應的 DOM `id` 已存在。  
- 確認 `brandConfig.status` 不是 `false`。  
- Popup 若 `autoShow: false`，需自行呼叫 `window.showPopup()`。  
- 推薦資料無效時 `hasValidPopupData === false`，彈窗不會顯示。

**Q：重複初始化沒有新建實例？**  
- 相同 `type` + `showPositionId` 組合會被視為同一實例而直接回傳既有元素。

**Q：如何關閉追蹤？**  
- 不傳 `GA4Key`，或傳空字串即可。

**Q：如何強制指定目前商品？**  
- 設定 `carousel.skuContent` 為實際 PID／SKU 字串。
