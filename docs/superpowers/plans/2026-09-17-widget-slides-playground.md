# Widget Slides Playground Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 在 `WIDGET-slides.html` 內嵌即時上手頁：可調參數預覽 + 複製 CDN 引入碼。

**Architecture:** Markdown 注入 `#playground` → template 三欄 UI；預覽用相對路徑載入 widget，可複製碼固定 Vercel CDN；進階欄摺疊。

**Tech Stack:** 原生 HTML/CSS/JS（既有 slides shell）、`inf-product-carousel-widget.js`

## Global Constraints

- 不新增獨立 playground 檔；不改 widget 本體
- 可複製 import 固定 CDN URL（見 spec）
- 預覽容器 id：`pgHeader` / `pgFooter`；複製碼用表單顯示的正式 id

---

### Task 1: Shell hooks + CSS + template + markdown 頁

**Files:** `docs/WIDGET-slides.html`, `WIDGET.md`

- [ ] 擴充 `#playground` 注入與 SEQ 正則
- [ ] 加入 `.pg` 樣式與 `<template id="svg-playground">`
- [ ] Markdown 新增「即時上手」頁（建議接在架構圖後）
- [ ] `render()` 後呼叫 `initPlaygroundIfPresent()`
- [ ] 鍵盤略過 `SELECT`／playground 內操作
- [ ] WIDGET.md 補一句

### Task 2: Playground 邏輯

- [ ] 讀表單 → buildExportConfig / buildPreviewConfig
- [ ] debounce remount：先移除既有 `inf-product-carousel-widget`
- [ ] 複製按鈕 + 錯誤顯示
- [ ] 本機開啟 slides 手動驗證

### Task 3: Commit

- [ ] Commit docs 變更
