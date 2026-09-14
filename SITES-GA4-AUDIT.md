# 四站商品輪播 × GA4 串接分析

檢查日期：2026-09-14  
對照基準：本 repo 的 `inf-product-carousel-component.js`（HEAD `fa987d0`，141,504 bytes）

結論先講：**不是四站都用最新組件，也不是四站輪播都有真正打進 GA4。**  
只有 Daisy Belle、Aurastro 載入最新 `inf-product-carousel-component.js`；但這兩站初始化時都**沒傳 `GA4Key`**，組件因此不會發送輪播事件。Cloud Inc、Guten 仍是 GTM 內嵌的舊輪播，沒有載入這份 Web Component。

---

## 1. 總表

| 網站 | 頁面 | 輪播實作 | 是否最新組件 | 輪播 GA4 | 說明 |
|------|------|----------|--------------|----------|------|
| Cloud Inc | [cloud-inc.tw/products/0104401](https://www.cloud-inc.tw/products/0104401) | GTM 內嵌舊版（`embeddedAdContainer`） | 否 | **實際上沒打到 property** | 有 `gtag('event', 'click_embedded_itemA')`，但 `send_to` 是空字串 |
| Guten | [guten.co/products/fl029-el0](https://www.guten.co/products/fl029-el0) | GTM 內嵌舊版（同上） | 否 | **有** | `send_to: G-QD2NPB2798` |
| Daily Belle | [dailybelle.com.tw/SalePage/Index/10690992](https://www.dailybelle.com.tw/SalePage/Index/10690992) | Vercel 最新組件 | **是（檔案內容相同）** | **沒有** | init 未傳 `GA4Key`，組件直接 return |
| Aurastro | [aurastro.com/products/a1819](https://www.aurastro.com/products/a1819) | Vercel 最新組件 | **是（檔案內容相同）** | **沒有** | 同上；GTM 另有 `G-PTE044PW46` 給尺寸／加購，沒傳給輪播 |

「最新版本」判定方式：線上腳本  
`https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-component.js`  
與本地檔案 **byte-for-byte 相同**（SHA-256 `60ad2e33…50b7`，`Last-Modified: 2026-09-14 03:27:03 GMT`）。

---

## 2. 組件本身怎麼決定要不要打 GA4

最新組件（`sendGAEvent`）規則：

1. 沒有 `config.GA4Key` → **整段不發送**
2. 有 `GA4Key` 才會 `gtag('event', …, { send_to: GA4Key })`，否則 fallback `dataLayer.push`

因此：**只載入最新 JS 不夠，GTM 初始化一定要帶 `GA4Key`。**  
目前 Daisy Belle、Aurastro 的 init 都只有 `brand` + `carousel`，沒有 `GA4Key`。

正確寫法應類似（腳本載入後，把要的參數一次傳進去即可；`GA4Key` 與 `brand` 同層）：

```javascript
window.initInfProductCarouselComponent({
  brand: 'AURASTRO',
  GA4Key: 'G-PTE044PW46',
  carousels: [{
    type: 'product',
    hide_size: true,
    skuContent: 'shopline_sku',
    showPositionId: { top: 'infFitsHeader' }
  }]
});
```

舊的 `forEach` 長寫法仍相容，補上 `GA4Key` 即可：

```javascript
config.carousels.forEach(carousel => {
  window.initInfProductCarouselComponent({
    brand: config.brand,
    GA4Key: config.GA4Key,
    carousel
  });
});
```

Daisy Belle 同結構，改為 `brand: 'DABE'`、`GA4Key: 'G-Q2G1XZY4T3'`、`skuContent: 'app91_sku'`。

詳見 [GA4.md](./GA4.md)、[USAGE.md](./USAGE.md)。

---

## 3. 分站細節

### 3.1 Cloud Inc（品牌代碼 `CI` / merchant handle `happyandfree`）

**載入鏈**

```
頁面 inline → https://www.inffits.com/gtm/gtm_HAPPYANDFREE_min.js
            → AfterbootstrapPR() → Product_Recommendation()
```

- **沒有**載入 `inf-product-carousel-component.js`
- 輪播是 GTM 裡手寫的 Swiper + `embeddedAdContainer`（標題如「喜歡這件的人也同時購入...」）
- 點擊有綁 `gtag`：
  - `click_embedded_itemA`
  - `bhv_click_embedded_itemA`
  - `corr_click_embedded_itemA`
- 但 `Product_Recommendation` 開頭是 `s="A", l=""`，事件帶 `send_to: l`  
  → **Measurement ID 是空的，GA4 收不到輪播事件**
- 同檔 `Trigger_infFITS` 也把 `gtag/js?id=`、`gtag('config','')` 設成空字串

**版本：** 舊內嵌實作，不是最新 Web Component。

---

### 3.2 Guten（品牌代碼 `GTN` / handle `guten`）

**載入鏈**

```
頁面 inline → https://www.inffits.com/gtm/gtm_GUTEN_min.js
            → Product_Recommendation()
```

- **沒有**載入 `inf-product-carousel-component.js`
- 同樣是 GTM 內嵌舊輪播（頁面可見「推薦您一起搭配」）
- 變數：`s="A"`, `c="G-QD2NPB2798"`
- 點擊會打：
  - `click_embedded_itemA`（商品、左右箭）
  - `bhv_click_embedded_itemA` / `corr_click_embedded_itemA`
  - `send_to: G-QD2NPB2798`

**版本：** 舊內嵌實作。  
**GA4：** 輪播點擊**有串到** `G-QD2NPB2798`（這是四站裡唯一輪播事件會進 GA4 的）。

與最新組件的差異：沒有 `sendGAEvent`、沒有 title-nav 事件、沒有 `recordMktClick` API、事件綁在 light DOM 而非 Shadow DOM。

---

### 3.3 Daily Belle（品牌代碼 `DABE`）

**載入鏈**

```
gtm_DABE_min.js → Product_Recommendation()
 → https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-component.js
```

初始化（精簡）：

```javascript
{
  brand: 'DABE',
  carousels: [{
    type: 'product',
    hide_size: true,
    skuContent: 'app91_sku',
    showPositionId: { top: 'infFitsHeader' }
  }]
}
// 傳入 init 時只有 { brand, carousel }，沒有 GA4Key
```

- 腳本內容 = 本地最新版
- GTM 另有尺寸相關 GA4 `G-Q2G1XZY4T3`，**沒傳給輪播**
- 組件 `if (!GA4Key) return;` → **輪播點擊不會進 GA4**
- 商品點擊仍可能打後端 `mkt_click_action_record`（不依賴 GA4Key）

本次用 curl 抓 Daisy Belle 商品頁時遇到 91APP「伺服器拒絕服務」頁；分析依據為線上 `gtm_DABE_min.js` 原始碼（HTTP 200）。

---

### 3.4 Aurastro（品牌代碼 `AURASTRO` / handle `aurastro`）

**載入鏈**

```
gtm_AURASTRO_min.js
 → 商品頁呼叫 Product_Recommendation()
 → 同上 Vercel 最新組件
```

初始化：

```javascript
{
  brand: 'AURASTRO',
  carousels: [{
    type: 'product',
    hide_size: true,
    skuContent: 'shopline_sku',
    showPositionId: { top: 'infFitsHeader' }
  }]
}
```

- 腳本內容 = 本地最新版
- GTM 全域有 `GA4Key="G-PTE044PW46"`，用於找尺寸、加購、`Extensions_mkt_adv`
- **沒有**把這個 key 傳進 `initInfProductCarouselComponent`
- 因此輪播 GA4 事件不會發；尺寸／加購那條線仍會進 `G-PTE044PW46`

---

## 4. 版本對照

| 來源 | 是否 `inf-product-carousel-component.js` | 與 repo 是否相同 |
|------|------------------------------------------|------------------|
| Vercel CDN（Daisy Belle、Aurastro 使用） | 是 | **相同** |
| `gtm_HAPPYANDFREE_min.js`（Cloud） | 否，舊內嵌 | 舊 |
| `gtm_GUTEN_min.js`（Guten） | 否，舊內嵌 | 舊 |

最新組件才有的能力（舊 GTM 輪播沒有）：

- 統一 `sendGAEvent`（gtag + dataLayer fallback）
- `ensureGtagLoaded`
- Shadow DOM 事件
- `click_embedded_item_title_nav_*`
- `recordMktClick` 後端點擊紀錄
- `GA4Key` 開關（沒傳就不打 GA）

---

## 5. 建議

若目標是「四站輪播都進 GA4、且都走最新組件」：

1. **Daisy Belle / Aurastro（已是最新組件）**  
   在 GTM `Product_Recommendation` 的 init 加上現有 Measurement ID：
   - DABE：`GA4Key: 'G-Q2G1XZY4T3'`
   - AURASTRO：`GA4Key: 'G-PTE044PW46'`

2. **Guten**  
   輪播 GA4 已通，但實作是舊版。若要對齊最新組件，改載入 Vercel JS，並傳 `GA4Key: 'G-QD2NPB2798'`，避免新舊兩套輪播重複。

3. **Cloud Inc**  
   先補上正確的 GA4 Measurement ID（目前是空字串），或直接改接最新組件並傳 `GA4Key`。  
   現況是「程式有打 gtag，但沒有 destination」。

---

## 6. 檢查方法（之後複驗）

1. DevTools → Network：是否出現 `inf-product-carousel-component.js`
2. Console：

```javascript
document.querySelector('inf-product-carousel-component')?.getAttribute('config')
```

   解析後應看到非空的 `GA4Key`

3. 點一張輪播商品，在 GA4 DebugView / Network `google-analytics.com/g/collect` 找  
   `click_embedded_itemA` 或 `{recom}_click_embedded_itemA`
