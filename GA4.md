# Product Carousel — GA4 事件總表

前提：初始化時與 `brand` 同層傳入 `GA4Key`。未傳或空字串則**不載入 gtag、不發送任何事件**。

```javascript
window.initInfProductCarouselComponent({
  brand: 'DES',
  GA4Key: 'G-XXXXXXXXXX',
  carousel: { /* ... */ }
});
```

`demo.html` 寫法：`GA4Key: 'G-G3WD6KWQG4'`，popup + product 各初始化一次，事件規格相同。

所有自訂事件皆經 `sendGAEvent`，並自動附上 `send_to: GA4Key`。每次點擊只發送 **1 次**。

---

## 事件總表

| 使用者行為 | 事件名稱 | event_category | event_label | value |
|------------|----------|----------------|-------------|-------|
| 頁面載入（組件動態載入 gtag 時） | `page_view` | （GA4 標準） | — | — |
| 點擊輪播商品（無推薦類型） | `click_embedded_itemA` | `infEmbeddedAdContainer-embedded` | `Title: {商品標題}` | 商品連結字串長度 |
| 點擊行為推薦商品 | `bhv_click_embedded_itemA` | 同上 | 同上 | 同上 |
| 點擊關聯推薦商品 | `corr_click_embedded_itemA` | 同上 | 同上 | 同上 |
| 點擊 Social Proof（加入購物車）商品 | `sp_atc_click_embedded_itemA` | 同上 | 同上 | 同上 |
| 點擊 Social Proof（成交）商品 | `sp_trans_click_embedded_itemA` | 同上 | 同上 | 同上 |
| 點擊桌面左箭頭 | `click_embedded_item_arrow_leftA` | 同上 | `arrow-left` | `10` |
| 點擊桌面右箭頭 | `click_embedded_item_arrow_rightA` | 同上 | `arrow-right` | `10` |
| 點擊手機標題區上一頁 | `click_embedded_item_title_nav_prevA` | 同上 | `title-nav-prev` | `10` |
| 點擊手機標題區下一頁 | `click_embedded_item_title_nav_nextA` | 同上 | `title-nav-next` | `10` |

事件名後綴 `A` 目前寫死於程式 `const test = 'A'`。

---

## 商品點擊事件名規則

商品卡片的 `data-event-recom`（來自 API 的 `event_recom`）會成為事件名前綴：

```
{event_recom}_click_embedded_itemA
```

| `event_recom` | 事件名稱 | 說明 |
|---------------|----------|------|
| （空） | `click_embedded_itemA` | 自訂 EDM 或無標記 |
| `bhv` | `bhv_click_embedded_itemA` | 行為推薦 |
| `corr` | `corr_click_embedded_itemA` | 關聯推薦 |
| `sp_atc` | `sp_atc_click_embedded_itemA` | Social Proof — 加入購物車 |
| `sp_trans` | `sp_trans_click_embedded_itemA` | Social Proof — 成交 |

---

## 導覽按鈕何時出現

| 條件 | 顯示 | 對應事件 |
|------|------|----------|
| 寬度 ≥ 768px 且 `arrowPosition` 為 `center` | 桌面左右箭頭 `.a-left` / `.a-right` | `click_embedded_item_arrow_leftA` / `_rightA` |
| 寬度 < 768px，或 `arrowPosition` 非 `center` | 標題旁 `.title-nav-prev` / `.title-nav-next` | `click_embedded_item_title_nav_prevA` / `_nextA` |

箭頭／標題導覽**不會**呼叫後端點擊 API。

---

## 與 GA4 並行的後端點擊（非 GA4 事件）

僅「點擊商品」會另 POST `https://api.inffits.com/mkt_click_action_record/`，與 GA4 各打一次、互不取代。

| 欄位 | 說明 |
|------|------|
| `recom_loc` | `popup` 或 `embed` |
| `recom_type` | 同 `data-event-recom` |
| `action` | `click` |
| `action_link` / `action_itemname` / `action_pid` | 商品連結、名稱、PID |

---

## 查詢建議

1. GA4 DebugView / 即時報表：確認 `send_to` 為設定的 Measurement ID。
2. 點一張商品應只出現 **1 筆** `{recom_}click_embedded_itemA`。
3. 點一次箭頭應只出現 **1 筆** 對應 `arrow_*` 或 `title_nav_*` 事件。
