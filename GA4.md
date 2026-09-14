# Product Carousel 組件 — GA4 事件整理

本文件整理 `inf-product-carousel-component.js` 內 Google Analytics 4（GA4）的設定方式、載入邏輯與事件規格。

---

## 1. 設定方式

在初始化組件時，於 `config` **與 `brand` 同階層** 傳入 `GA4Key`：

```javascript
window.initInfProductCarouselComponent({
  brand: 'DES',
  GA4Key: 'G-XXXXXXXXXX', // Measurement ID
  carousels: [ /* ... */ ]
});
```

舊寫法仍相容：`config.carousels.forEach(carousel => initInfProductCarouselComponent({ brand, GA4Key, carousel }))`。

| 欄位 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `GA4Key` | `string` | `''` | GA4 Measurement ID（例如 `G-G3WD6KWQG4`）。為空時**不載入 gtag、不發送事件**。 |

Demo 範例見 `demo.html`。

---

## 2. 載入與發送機制

### 2.1 `ensureGtagLoaded(GA4Key, callback)`

組件在 `loadEmbeddedScript` 時會呼叫此方法：

1. 若未設定 `GA4Key` → 直接略過。
2. 若頁面已有對應 `gtag/js?id={GA4Key}` 腳本 → 確保 `dataLayer` / `gtag` 可用後回呼。
3. 否則動態載入：
   - 初始化 `window.dataLayer`
   - `gtag('js', new Date())`
   - `gtag('config', GA4Key, { send_page_view: true })`
   - 載入 `https://www.googletagmanager.com/gtag/js?id={GA4Key}`
4. 以 `window.gtagLoadingPromise` 避免重複載入；完成後設 `window.infGAReady = true`。

### 2.2 `sendGAEvent(eventName, eventData)`（主要路徑）

統一發送函式，行為如下：

1. 無 `GA4Key` → 不發送。
2. 自動附加 `send_to: GA4Key`。
3. **優先** `window.gtag('event', eventName, fullEventData)`。
4. **備用** `window.dataLayer.push({ event: eventName, ...fullEventData })`（相容 GTM）。

> 部分舊版 jQuery 綁定仍直接呼叫全域 `gtag(...)`，未走 `sendGAEvent`。實際有效路徑以 Shadow DOM 上的原生事件監聽為主。

---

## 3. 事件命名規則

### 3.1 A/B 後綴

程式內寫死：

```javascript
const test = 'A';
```

所有事件名稱結尾會加上 `test`，目前皆為 **`A`**。

### 3.2 推薦類型前綴（`event_recom`）

商品項目若帶有 `data-event-recom`（來自 API 回傳的 `event_recom`），點擊事件名稱會加上前綴：

```
{event_recom}_click_embedded_itemA
```

常見 `event_recom` 值：

| 值 | 來源說明 |
|----|----------|
| `bhv` | 行為推薦 |
| `corr` | 關聯推薦 |
| `sp_atc` | Social Proof — 加入購物車 |
| `sp_trans` | Social Proof — 成交 |
| （空） | 自訂 EDM 或無標記時，事件名為 `click_embedded_itemA` |

範例：

- `bhv_click_embedded_itemA`
- `corr_click_embedded_itemA`
- `click_embedded_itemA`（無推薦類型）

---

## 4. 事件一覽

### 4.1 商品點擊

| 事件名稱 | 觸發時機 | 主要參數 |
|----------|----------|----------|
| `{event_recom}_click_embedded_itemA` 或 `click_embedded_itemA` | 使用者點擊輪播商品（`.embeddedItem`） | 見下表 |

**參數（`sendGAEvent` 路徑）：**

| 參數 | 說明 |
|------|------|
| `send_to` | `GA4Key` |
| `event_category` | `infEmbeddedAdContainer-embedded` |
| `event_label` | `Title: {商品標題}` |
| `value` | 商品連結字串長度 |

> 同一次點擊也會呼叫後端 `recordMktClick` API（見第 5 節），與 GA4 並行、互不取代。

---

### 4.2 桌面箭頭（輪播左右）

| 事件名稱 | 觸發元素 | 參數 |
|----------|----------|------|
| `click_embedded_item_arrow_leftA` | `.a-left` | `event_category`: `infEmbeddedAdContainer-embedded`<br>`event_label`: `arrow-left`<br>`value`: `10` |
| `click_embedded_item_arrow_rightA` | `.a-right` | `event_category`: `infEmbeddedAdContainer-embedded`<br>`event_label`: `arrow-right`<br>`value`: `10` |

---

### 4.3 手機版標題區導覽

當 `arrowPosition` 非 `center` 或容器寬度 &lt; 768px 時，改顯示標題旁導覽按鈕：

| 事件名稱 | 觸發元素 | 參數 |
|----------|----------|------|
| `click_embedded_item_title_nav_prevA` | `.title-nav-prev` | `event_category`: `infEmbeddedAdContainer-embedded`<br>`event_label`: `title-nav-prev`<br>`value`: `10` |
| `click_embedded_item_title_nav_nextA` | `.title-nav-next` | `event_category`: `infEmbeddedAdContainer-embedded`<br>`event_label`: `title-nav-next`<br>`value`: `10` |

---

### 4.4 舊版 / 備用綁定（仍存在於程式碼）

以下為較早的 jQuery 綁定，事件命名與參數略有差異，可能與主要路徑重複觸發，整理供對照：

| 事件名稱 | 觸發 | 備註 |
|----------|------|------|
| `click_embedded_itemA` | `.a-left` / `.a-right` | `event_label` 為 `arrow-left` / `arrow-right`（與商品點擊同名，靠 label 區分） |
| `click_embedded_item_arrow-leftA` | `#swiper-wrapper-corr .a-left` | 連字號 `-`，非底線 `_` |
| `click_embedded_item_arrow-rightA` | `#swiper-wrapper-corr .a-right` | 連字號 `-`，非底線 `_` |
| 商品點擊（舊） | `.embeddedItem` 直接 `gtag` | `event_category` 為 `embedded` 或 `swiper-wrapper-corr-embedded`；參數用 `event_value` 而非 `value` |

---

## 5. 與 GA4 並行的後端點擊紀錄

商品點擊時除 GA4 外，會 POST 至：

```
https://api.inffits.com/mkt_click_action_record/
```

Payload 範例：

```json
{
  "Brand": "DES",
  "GVID": "",
  "LGVID": "...",
  "MRID": "...",
  "recom_type": "bhv",
  "recom_loc": "embed",
  "action": "click",
  "action_link": "https://...",
  "action_itemname": "商品名稱",
  "action_pid": "..."
}
```

| 欄位 | 說明 |
|------|------|
| `recom_loc` | `popup` 或 `embed`（依 `carouselType`） |
| `recom_type` | 同 `data-event-recom` |
| `action_*` | 點擊的商品連結、名稱、PID |

箭頭／導覽按鈕**不會**呼叫此 API。

---

## 6. 在 GA4 後台查詢建議

1. **即時報表** → 事件：確認 `GA4Key` 正確後，點擊 Demo 商品／箭頭是否出現對應事件。
2. **自訂維度／探索**：可依 `event_category`、`event_label`、`recom` 前綴篩選。
3. 建議在 GA4 將下列事件標記為關鍵事件（依業務需求）：
   - `*_click_embedded_itemA`（商品 CTR）
   - `click_embedded_item_arrow_*A` / `click_embedded_item_title_nav_*A`（互動）

---

## 7. 快速對照表（目前主要有效事件）

| 使用者行為 | 事件名稱 |
|------------|----------|
| 點擊推薦商品 | `{bhv\|corr\|sp_atc\|sp_trans}_click_embedded_itemA` 或 `click_embedded_itemA` |
| 點擊左箭頭（桌面） | `click_embedded_item_arrow_leftA` |
| 點擊右箭頭（桌面） | `click_embedded_item_arrow_rightA` |
| 點擊上一頁（手機標題導覽） | `click_embedded_item_title_nav_prevA` |
| 點擊下一頁（手機標題導覽） | `click_embedded_item_title_nav_nextA` |

---

## 8. 注意事項

1. **未設定 `GA4Key`**：完全不追蹤。
2. **事件後綴 `A`**：目前寫死在程式中；若要做 A/B，需調整 `const test = 'A'`。
3. **命名不一致**：舊綁定使用 `arrow-left`（連字號），新路徑使用 `arrow_left`（底線）；報表篩選時需注意。
4. **重複綁定**：同一元素可能同時有原生 `addEventListener` 與 jQuery `.on`，實測時可能出現重複事件，解讀報表時需留意。
5. **舊版三元運算子寫法**：部分直接呼叫 `gtag` 的程式為  
   `eventRecom ? \`${eventRecom}_\` : '' + 'click_embedded_item' + test`  
   （未加括號），當 `eventRecom` 有值時事件名可能變成僅 `{eventRecom}_`。主要路徑的 `sendGAEvent` 有正確括號，建議以該路徑為準。
