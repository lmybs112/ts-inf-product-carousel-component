// 檢查是否已經定義過，避免重複定義
if (!customElements.get('inf-product-carousel-component')) {
  class InfProductCarouselComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['config'];
    }
  
            // 整合的彈窗處理函數
            handlePopup(autoShow = true) {
              // 創建並添加 CSS 樣式
              const popupStyles = `
              #infPopupproductCarousel *{
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              #infPopupproductCarousel {
                  position: fixed;
                  left: -500px;
                  bottom: 20px;
                  width: 350px;
                  max-width: calc(100vw - 40px);
                  min-height: 240px;
                  max-height: 80vh;
                  background: rgba(255, 255, 255, 1);
                  // background: rgba(255, 255, 255, 0.98);
                  border-radius: 16px;
                  box-shadow: 
                      0 8px 32px rgba(0, 0, 0, 0.08),
                      0 2px 8px rgba(0, 0, 0, 0.04),
                      inset 0 1px 0 rgba(255, 255, 255, 0.8);
                  z-index: 1000;
                  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                  border: 1px solid rgba(0, 0, 0, 0.06);
                  backdrop-filter: blur(20px);
              }
  
              /* 小螢幕響應式設計 */
              @media (max-width: 480px) {
                  #infPopupproductCarousel {
                      width: calc(100vw - 40px);
                      left: -100vw;
                      bottom: 16px;
                      border-radius: 12px;
                      min-height: 240px;
                      max-height: 70vh;
                  }
                  
                  #infPopupproductCarousel.show {
                      left: 20px;
                  }
              }
  
              /* 超小螢幕響應式設計 */
              @media (max-width: 360px) {
                  #infPopupproductCarousel {
                      width: calc(100vw - 24px);
                      left: -100vw;
                      bottom: 12px;
                      border-radius: 10px;
                  }
                  
                  #infPopupproductCarousel.show {
                      left: 12px;
                  }
              }
  
              #infPopupproductCarousel.show {
                  left: 20px;
              }
  
              .popup-close-btn {
                  position: absolute;
                  top: 8px;
                  right: 8px;
                  width: 24px;
                  height: 24px;
                  background: rgba(255, 255, 255, 0.95);
                  border: 1px solid rgba(0, 0, 0, 0.08);
                  border-radius: 50%;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: 300;
                  color: rgba(0, 0, 0, 0.6);
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  z-index: 10;
                  backdrop-filter: blur(8px);
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                  line-height: 1;
              }
  
              .popup-close-btn:hover {
                  background: rgba(0, 0, 0, 0.05);
                  border-color: rgba(0, 0, 0, 0.12);
                  color: rgba(0, 0, 0, 0.8);
                  transform: scale(1.05);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              }
  
              .popup-close-btn:active {
                  transform: scale(0.95);
                  background: rgba(0, 0, 0, 0.08);
              }
  
              .popup-content {
                  padding: 12px;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  max-width: 100%;
                  overflow: auto;
              }
              
              /* 確保組件在 popup 內正確顯示 */
              #infPopupproductCarousel {
                  position: fixed;
                  left: -500px;
                  bottom: 20px;
                  max-width: calc(100vw - 40px);
                  min-height: 240px;
                  max-height: 80vh;
                  background: rgba(255, 255, 255, 1);
              //     background: linear-gradient(135deg, 
              // rgba(255, 255, 255, 0.75) 0%, 
              // rgba(255, 255, 255, 0.5) 100%);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
                  border-radius: 16px;
                  box-shadow: 
                      0 8px 32px rgba(0, 0, 0, 0.08),
                      0 2px 8px rgba(0, 0, 0, 0.04),
                      inset 0 1px 0 rgba(255, 255, 255, 0.8);
                  z-index: 1000;
                  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                  border: 1px solid rgba(0, 0, 0, 0.06);
                  overflow: hidden;
                  display: flex;
                  justify-content: center;
                  align-items: center;
              }
  
              #infPopupproductCarousel.show {
                  left: 20px;
              }
              
              /* 限制組件在 popup 內的顯示 */
              #infPopupproductCarousel inf-product-carousel-component {
                  width: 100% !important;
                  height: 100% !important;
                  max-width: 100% !important;
                  max-height: 100% !important;
                  overflow: hidden !important;
              }
              /* 確保 popupProductContent 容器正確限制組件 */
                #popupProductContent #recommendation-loading,
                #popupProductContent .embeddedAdContainer__wrapper {
                  width: 100% !important;
                  height: auto !important;
                  max-width: 100% !important;
                  max-height: none !important;
                  overflow: visible !important;
                  position: relative !important;
              }
              
              /* 讓 loading 在彈窗中置中顯示 */
              #popupProductContent #recommendation-loading {
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  min-height: 200px !important;
                  width: 100% !important;
                  height: auto !important;
              }
              
              /* 防止組件內容溢出 */
               #popupProductContent * {
                  max-width: 100% !important;
                  box-sizing: border-box !important;
              }
          `;
  
              // 添加樣式到 head
              const styleElement = document.createElement('style');
              styleElement.textContent = popupStyles;
              document.head.appendChild(styleElement);
  
              // 創建彈窗 HTML 元素
              const popupHTML = `
              <div id="infPopupproductCarousel">
                  <button class="popup-close-btn" onclick="closePopup()">×</button>
                  <div class="popup-content">
                      <div id="popupProductContent" style="width: 100%; height: auto; overflow: visible;">
                      </div>
                  </div>
              </div>
          `;
  
              // 添加彈窗到 body
              document.body.insertAdjacentHTML('beforeend', popupHTML);
  
              const popup = document.getElementById('infPopupproductCarousel');
  
  
  
              // 點擊彈窗外部關閉彈窗 - 使用更穩健的實現
              let isPopupVisible = false;
              let closeTimeout = null;
              
              // 顯示彈窗時設置狀態
              function showPopup() {
                  if (popup) {
                      popup.classList.add('show');
                      // 直接設置樣式確保彈窗顯示
                      popup.style.left = '20px';
                      isPopupVisible = true;
                      
                      // 延遲一下再啟用外部點擊關閉，避免立即關閉
                      if (closeTimeout) {
                          clearTimeout(closeTimeout);
                      }
                      closeTimeout = setTimeout(() => {
                          // 啟用外部點擊關閉
                          document.addEventListener('click', handleOutsideClick);
                      }, 300);
                  } else {
                      console.error('彈窗元素不存在');
                  }
              }
              
              // 關閉彈窗時清理狀態
              function closePopup() {
                  if (popup) {
                      popup.classList.remove('show');
                      // 重置樣式確保彈窗完全隱藏
                      popup.style.left = '-500px';
                      isPopupVisible = false;
                      
                      // 移除外部點擊監聽器
                      document.removeEventListener('click', handleOutsideClick);
                      
                      // 清理超時
                      if (closeTimeout) {
                          clearTimeout(closeTimeout);
                          closeTimeout = null;
                      }
                  } else {
                      console.error('彈窗元素不存在');
                  }
              }
              
              // 處理外部點擊的函數
              function handleOutsideClick(event) {
                  // 只有當彈窗可見時才處理外部點擊
                  if (!isPopupVisible || !popup) return;
                  
                  // 檢查點擊的元素是否在 popup 內部
                  if (!popup.contains(event.target)) {
                      // 檢查是否點擊了顯示彈窗按鈕或重置推薦按鈕，如果是則不關閉彈窗
                      if (event.target.id === 'showPopupBtn' || event.target.closest('#showPopupBtn') ||
                          event.target.id === 'resetRecomBtn' || event.target.closest('#resetRecomBtn') ||
                          event.target.id === 'resetRecomWithBidBtn' || event.target.closest('#resetRecomWithBidBtn') ||
                          event.target.id === 'resetRecomFullBidBtn' || event.target.closest('#resetRecomFullBidBtn')) {
                          return;
                      }
                      closePopup();
                  }
              }
  
              // 防止點擊 popup 內部時觸發外部點擊事件
              popup.addEventListener('click', function (event) {
                  event.stopPropagation();
              });
  
              // 將 showPopup 和 closePopup 函數設為全域可訪問
              window.showPopup = showPopup;
              window.closePopup = closePopup;
              window.popupautoShow = autoShow; // 保存 autoShow 到全域變數
              
              // 添加重置推薦資料的函數
              window.resetRecom = function(newBid) {
                  if (popup) {
                      // 設置標記，防止自動顯示彈窗
                      window.resetRecomCalled = true;
                      
                      // 觸發重新載入事件，將 newBid 參數傳遞給 fetchRecommendations
                      const reloadEvent = new CustomEvent('popup-reload-recommendations', {
                          detail: { 
                              popupElement: popup,
                              newBid: newBid  // 將 newBid 參數傳遞給事件
                          }
                      });
                      document.dispatchEvent(reloadEvent);
                      
                      if (newBid && typeof newBid === 'object') {
                          // console.log('已傳遞新的 bid 配置：', newBid);
                      }
                      
                      // console.log('正在重新獲取推薦資料...');
                  } else {
                      // console.log('彈窗元素不存在，無法重置推薦資料');
                  }
              };
              
              // 根據 autoShow 決定是否自動顯示彈窗
              if (autoShow === true) {
                  // true 模式：等待 loading 完成後自動顯示
                  // 注意：在 popup 模式下，彈窗不會立即顯示，而是等待 loading 完成後再顯示
              } else if (autoShow === false) {
                  // false 模式：不自動顯示，由使用者手動調用 showPopup()
                  // console.log('彈窗已設置為手動模式，請手動調用 window.showPopup() 來顯示彈窗');
              }
          }
  
  
  
    connectedCallback() {
      // 元素被加入 DOM 時不需要初始化，由 attributeChangedCallback 處理
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'config' && oldValue !== newValue) {
        const config = JSON.parse(newValue || '{}');
        this.fetchBrandConfigAndInit(config);
      }
        }
  
    async fetchBrandConfigAndInit(config = {}) {
      const { brand, carousel} = config;
      let brandConfig = {};
      config.showPositionId = carousel.showPositionId;
      
      // 在組件初始化時清理過期快取
      this.cleanupExpiredCache();
      
      try {
        // 直接調用品牌配置 API，不使用快取（確保獲取最新配置）
        const brandConfigResponse = carousel.type === 'product' ? await fetch('https://api.inffits.com/mkt_brand_config_proc/GetItems', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ Brand: brand })
        }): {ok: true, json: () => Promise.resolve({})};
  
        if (!brandConfigResponse.ok) {
          throw new Error(`品牌配置 API 調用失敗: ${brandConfigResponse.status}`);
        }
  
        const brandConfigResponseData = await brandConfigResponse.json();
        brandConfig =carousel.brandConfig? carousel.brandConfig :  brandConfigResponseData.find(
            item => item.Module === 'Product_Carousel_Widget'
          )?.ConfigData.Section_Info[0];
        brandConfig.type = carousel.type;
        // console.log('品牌配置資料:', brandConfig);
  
        // 將 brandConfig 轉換為標準配置格式
        const convertedBrandConfig = this.convertBrandConfig(brandConfig, config);
        // console.log('轉換後的品牌配置:', convertedBrandConfig);
        // 將轉換後的品牌配置合併到原有配置中
        const mergedConfig = {
          ...config,
          ...convertedBrandConfig,
          ...carousel, // 新增：確保 carousel 配置（包括 skuContent）被包含
          brandConfig: brandConfig, // 保留原始 brandConfig 供其他地方使用
          carouselType: carousel.type // 添加 carousel 類型
        };
  
        if(mergedConfig.brandConfig?.status && mergedConfig.carouselType === 'popup'){
          this.handlePopup(mergedConfig.brandConfig.autoShow);
        }
  
        // 使用合併後的配置進行初始化，並在初始化後自動移動到目標容器
        this.initProductRecommendation(mergedConfig, true);
        
      } catch (error) {
        console.error('獲取品牌配置時發生錯誤:', error);
        // 如果品牌配置 API 失敗，仍然使用原有配置初始化
        this.initProductRecommendation(config);
      }
    }
  
    convertBrandConfig(brandConfig, config = {}) {
      if (!brandConfig) return {};
  
      const convertedConfig = {};
  
      // CarouselButton: true → arrowPosition = 'center', false → arrowPosition = 'none'
      if (typeof brandConfig.CarouselButton === 'boolean') {
        convertedConfig.arrowPosition = brandConfig.CarouselButton ? 'center' : 'none';
      }
  
      // Description: 變更 description
      if (brandConfig.Description) {
        convertedConfig.description = brandConfig.Description;
      }
        // Title: 變更 title
      if (brandConfig.Title) {
        convertedConfig.title = brandConfig.Title;
      }
  
      //  RecommendMode: 變更 eecommendMode
      if(brandConfig.RecommendMode) {
        convertedConfig.recommendMode = brandConfig.RecommendMode;
      }
  
      // hide_size
      if (config.carousel.hide_size) {
        convertedConfig.hide_size = config.carousel.hide_size;
      }
      // bid
      if (config.carousel.bid) {
        convertedConfig.bid = config.carousel.bid;
      }
      // background
      if (config.carousel.backgroundColor) {
        convertedConfig.backgroundColor = config.carousel.backgroundColor;
      }
      // skuContent
      if (config.carousel.skuContent) {
        convertedConfig.skuContent = config.carousel.skuContent;
      }
  
      // CarouselLayout: 變更 breakpoints 768 的 slidesPerView, slidesPerGroup
      if (brandConfig.CarouselLayout && typeof brandConfig.CarouselLayout === 'number') {
        convertedConfig.breakpoints = {
          768: {
            slidesPerView: brandConfig.CarouselLayout,
            slidesPerGroup: Math.floor(brandConfig.CarouselLayout),
            spaceBetween: config.carousel.type === 'product' ? 24 : 12,
            resistanceRatio: 0,
            loopFillGroupWithBlank: true
          },
        };
      }
  
      // Location: 新增 showPositionId 配置
      if (brandConfig.Location) {
        // 使用外部傳入的 showPositionId 配置，而不是寫死的值
        if (config.showPositionId) {
          convertedConfig.showPositionId = config.showPositionId;
          // 根據 Location 設定對應的 containerId
          convertedConfig.containerId = brandConfig.Location === 'top' ? config.showPositionId.top : config.showPositionId.bottom;
        } else {
          // 如果沒有外部 showPositionId 配置，使用預設值
          convertedConfig.showPositionId = {
            top: 'infFitsHeader',
            bottom: 'infFitsFooter'
          };
          convertedConfig.containerId = brandConfig.Location === 'top' ? 'infFitsHeader' : 'infFitsFooter';
        }
      }
  
      // DisplayMode: 保留 (您已經寫好了)
      if (brandConfig.DisplayMode) {
        convertedConfig.displayMode = brandConfig.DisplayMode;
        // console.log('convertBrandConfig - 從品牌配置讀取 DisplayMode:', brandConfig.DisplayMode);
      } else {
        // console.log('convertBrandConfig - 品牌配置中沒有 DisplayMode');
      }
  
      // status: 組件啟用狀態
      if (typeof brandConfig.status === 'boolean') {
        convertedConfig.enabled = brandConfig.status;
      }

      return convertedConfig;
    }
  
    initProductRecommendation(config = {}, shouldAutoAppend = false) {
      // 檢查組件是否啟用
      if (config.enabled === false) {
        // console.log('組件已停用，不進行初始化');
        return;
      }
      
      const defaultConfig = {
        brand: 'JERSCY',
        containerId: 'infFitsFooter',
        customEdm: [],
        backgroundColor: 'rgba(255,255,255,1)',
        // backgroundColor: 'rgba(255,255,255,0.3)',
        title: '推薦您也可以這樣搭配',
        description: '',
        displayMode: 'SaleRate',
        recommendMode: 'bhv,corr,sp_atc,sp_trans',
        customPadding: null,
        arrowPosition: 'center',
        autoplay: true,
        hide_discount: false,
        hide_size: false,
        ctype_val: ['underwear'],
        skuContent: this.getDefaultSkuContent(), // 新增：自動判斷預設 SKU 方法
        bid: {
          HV: '163',
          WV: '50',
          CC: '97.5_97.5',
          DataItem: '0100',
          Shoulder: '',
          UpChest: '',
          DnChest: '',
          Waist: '',
          Hip: '',
          Brand: 'JERSCY',
          ClothID: '',
          Sizes: '',
          FitP: '0,0,0,0',
          Gender: 'M',
          FMLpath: 'FMLSep',
          BUS: '0',
          GVID: '',
          LGVID: '',
          MRID: 'INF',
          ga_id: 'x',
          Pattern_Prefer: '1'
        },
        breakpoints: {
          768: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            spaceBetween: 24,
            loopFillGroupWithBlank: true
          },
          0: {
            slidesPerView: 2.5,
            slidesPerGroup: 2,
            spaceBetween: 12,
            speed: 750,
            resistanceRatio: 0,
            loopFillGroupWithBlank: true
          }
        }
      };
  
      // 合併配置：預設配置 < 用戶配置（已包含轉換後的品牌配置）
      const finalConfig = {
        ...defaultConfig,
        ...config,
        breakpoints: {
          ...defaultConfig.breakpoints,
          ...(config?.breakpoints || {})
        }
      };
  
      const {
        brand,
        containerId,
        customEdm,
        hide_discount,
        hide_size,
        series_out,
        series_in,
        ctype_val,
        bid,
        backgroundColor,
        title,
        description,
        displayMode,
        recommendMode,
        autoplay,
        arrowPosition,
        customPadding,
        skuContent // 新增：從配置中取得 skuContent 設定
      } = finalConfig;
      // console.error('finalConfig-----', finalConfig);
  
      const sortedBreakpoints = Object.keys(finalConfig.breakpoints)
        .map(Number)
        .sort((a, b) => b - a)
        .reduce((acc, key) => {
          acc[key] = finalConfig.breakpoints[key];
          return acc;
        }, {});
  
            const Brand = brand;
      // 修改：根據 skuContent 設定選擇對應的方法
      // 如果 skuContent 是具體的數值，直接使用；否則根據類型選擇對應的方法
      const skuContentValue = (typeof skuContent === 'string' && skuContent !== 'app91_sku' && skuContent !== 'shopline_sku') 
        ? skuContent 
        : (skuContent === 'app91_sku' ? this.app91_sku() : this.shopline_sku());
      const show_up_position_before = `#${containerId}`;
      const test = 'A';
      let GA4Key = '';
  
      // 輸出最終配置以供調試
      // console.log('最終配置:', finalConfig);
      // console.log('原始品牌配置:', config.brandConfig);
  
      // 如果需要自動 append 且品牌配置指定了 Location，則自動移動到目標容器
      if (shouldAutoAppend && config.brandConfig && config.brandConfig.Location) {
        const appendSuccess = this.appendToTargetContainer(containerId, backgroundColor);
        
        if (!appendSuccess) {
          // 如果自動 append 失敗，使用原來的 render 方法
          this.render(containerId, backgroundColor, title);
        }
      } else {
        // 正常渲染到 shadow DOM
        this.render(containerId, backgroundColor, title);
      }
  
      this.ensureEmbeddedAdJQueryLoaded(() => this.loadEmbeddedScript(containerId, {
        brand,
        customEdm,
        hide_discount,
        hide_size,
        series_out,
        series_in,
        ctype_val,
        bid,
        title,
        description,
        displayMode,
        recommendMode,
        autoplay,
        arrowPosition,
        customPadding,
        sortedBreakpoints,
        skuContent: skuContentValue, // 修改：傳遞實際的 skuContent 值
        skuContentType: skuContent, // 新增：傳遞 skuContent 類型供後續使用
        show_up_position_before,
        test,
        GA4Key,
        carouselType: finalConfig.carouselType || 'product' // 添加 carousel 類型
      }));
    }
  
    render(containerId, backgroundColor, title) {
      // 先清空 shadow DOM，準備根據配置重新渲染
      this.shadowRoot.innerHTML = `
        <div id="temp-container" style="display: none;">
          <div id="recommendation-loading" style="display: none;">
            <span class="loading-text">Loading...</span>
          </div>
        </div>
      `;
    }
  
    appendToTargetContainer(containerId, backgroundColor) {
      // 檢查目標容器是否存在於外部 DOM 中
      const targetContainer = document.getElementById(containerId);
      
      if (targetContainer) {
        // 如果目標容器存在，將組件內容移動到目標容器
        const componentContent = `
          <div id="${containerId}" style="background-color: ${backgroundColor};margin: 0 auto;height: 100%;width: 100%;">
            <div id="recommendation-loading" style="height: 100%; display: none;">
              <span class="loading-text">Loading...</span>
            </div>
          </div>
        `;
        
        // 更新 shadow DOM 內容
        this.shadowRoot.innerHTML = componentContent;
        
        // 將整個組件 append 到目標容器
        targetContainer.appendChild(this);
        
        // 設置標記，表示組件已被 append 到外部容器
        this.isAppendedToExternalContainer = true;
        
        // console.log(`組件已自動 append 到容器: ${containerId}`);
        return true;
      } else {
        // console.warn(`目標容器 ${containerId} 不存在，組件將保持在當前位置`);
        return false;
      }
    }
  
    member_id_91APP() {
      let member_id = '';
      if (typeof dataLayer !== 'undefined') {
        for (let i = 0; i < dataLayer.length; i++) {
          if (dataLayer[i].Action === 'Product-Detail') {
            member_id = dataLayer[i].Uid !== '' ? dataLayer[i].Uid : '';
            break;
          } else {
            member_id = '';
          }
        }
      }
      return member_id;
    }
  
    member_id_Shopline() {
      let member_id = '';
      return member_id;
    }
  
    member_id_plain_me() {
      let member_id = '';
      if (typeof dataLayer !== 'undefined') {
        for (let i = 0; i < dataLayer.length; i++) {
          if (dataLayer[i].Action === 'Product-Detail') {
            member_id = dataLayer[i].Uid !== '' ? dataLayer[i].Uid : '';
            break;
          } else {
            member_id = '';
          }
        }
      }
      return member_id;
    }

    // 新增：自動判斷預設 SKU 方法
    getDefaultSkuContent() {
      try {
        // 檢查當前 URL 是否包含 '/SalePage/Index/'
        if (document.location.href.includes('/SalePage/Index/')) {
          return 'app91_sku';
        } else {
          return 'shopline_sku';
        }
      } catch (error) {
        console.error('getDefaultSkuContent 判斷錯誤:', error);
        return 'shopline_sku'; // 發生錯誤時使用預設值
      }
    }
  
    plain_me_sku() {
      try {
        let skuContent;
        const metaTag = document.querySelector('meta[property="og:sku"]');
        if (metaTag) {
          const content = metaTag.getAttribute('content');
          if (content) {
            skuContent = content.split('-')[0];
          }
        } else if (document.querySelector('.prodnoBox') !== null) {
          const prodnoBox = document.querySelector('.prodnoBox');
          if (prodnoBox && prodnoBox.innerText) {
            const textParts = prodnoBox.innerText.split(':');
            if (textParts.length > 1) {
              skuContent = textParts[1].split('-')[0];
            }
          }
        }
        
        return skuContent || ''; // 如果解析失敗，返回空字串
      } catch (error) {
        console.error('plain_me_sku 解析錯誤:', error);
        return ''; // 發生錯誤時返回空字串
      }
    }

    app91_sku() {
        try {
            var urlParts = document.location.href.split('?')[0].split('/SalePage/Index/')
            
            // 檢查是否找到 '/SalePage/Index/' 路徑
            if (urlParts.length < 2) {
                console.warn('app91_sku: URL 中找不到 "/SalePage/Index/" 路徑，返回空字串');
                return ''; // 返回空字串
            }
            
            var skuContent = urlParts[1]
            return skuContent || ''; // 如果解析失敗，返回空字串
        } catch (error) {
            console.error('app91_sku 解析錯誤:', error);
            return ''; // 發生錯誤時返回空字串
        }
    }

    shopline_sku() {
      try {
        var data = document.documentElement.innerHTML
        var skuParts = data.split('"sku":"')
        
        // 檢查是否找到 "sku":" 字串
        if (skuParts.length < 2) {
          console.warn('shopline_sku: 在頁面中找不到 "sku":" 字串，返回空字串');
          return ''; // 返回空字串
        }
        
        var skuContent = skuParts[1].split('"')[0].split(':')[0]
        return skuContent || ''; // 如果解析失敗，返回空字串
      } catch (error) {
        console.error('shopline_sku 解析錯誤:', error);
        return ''; // 發生錯誤時返回空字串
      }
    }

    ensureEmbeddedAdJQueryLoaded(callback) {
      if (typeof jQuery === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
        script.type = 'text/javascript';
        script.onload = () => {
          this.loadSwiperScript(() => {
            callback();
          });
        };
        script.onerror = () => console.error('載入 jQuery 時出錯');
        document.head.appendChild(script);
      } else {
        this.loadSwiperScript(() => {
          callback();
        });
      }
    }
  
    loadSwiperScript(callback) {
      // 將 Swiper 樣式載入到 shadowRoot（樣式可以在 shadow DOM 中）
      const swiperStylesheet = document.createElement('link');
      swiperStylesheet.rel = 'stylesheet';
      swiperStylesheet.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
      
      // 等待樣式載入完成
      swiperStylesheet.onload = () => {
        // console.log('Swiper 樣式已載入完成');
        this.loadSwiperJS(callback);
      };
      swiperStylesheet.onerror = () => {
        console.error('載入 Swiper 樣式時出錯');
        // 即使樣式載入失敗，也繼續載入 JS
        this.loadSwiperJS(callback);
      };
      
      this.shadowRoot.appendChild(swiperStylesheet);
    }
    
    loadSwiperJS(callback) {
      // 檢查 Swiper 是否已經載入到全域作用域
      if (typeof window.Swiper === 'undefined') {
        const swiperScript = document.createElement('script');
        swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
        swiperScript.onload = () => {
          // console.log('Swiper 腳本已載入到全域作用域');
          if (callback) callback();
        };
        swiperScript.onerror = () => {
          console.error('載入 Swiper 腳本時出錯');
          if (callback) callback(); // 即使出錯也執行回調，避免卡住
        };
        // 將腳本添加到 document.head 而不是 shadowRoot，確保 Swiper 在全域可用
        document.head.appendChild(swiperScript);
      } else {
        // Swiper 已存在於全域作用域，跳過載入
        // console.log('Swiper 已存在，跳過載入');
        if (callback) callback();
      }
    }
  
    loadEmbeddedScript(containerId, config) {
      const {
        brand,
        customEdm,
        hide_discount,
        hide_size,
        series_out,
        series_in,
        ctype_val,
        bid,
        title,
        description,
        displayMode,
        recommendMode,
        autoplay,
        arrowPosition,
        customPadding,
        sortedBreakpoints,
        skuContent,
        skuContentType, // 新增：從 config 中取得 skuContentType
        show_up_position_before,
        test,
        GA4Key,
        carouselType
      } = config;
  
      const $ = jQuery;
      const shadowRoot = this.shadowRoot;
  
      const googleFontLink = document.createElement('link');
      googleFontLink.rel = 'preconnect';
      googleFontLink.href = 'https://fonts.googleapis.com';
      shadowRoot.appendChild(googleFontLink);
  
      const googleFontLink2 = document.createElement('link');
      googleFontLink2.rel = 'preconnect';
      googleFontLink2.href = 'https://fonts.gstatic.com';
      googleFontLink2.crossorigin = 'anonymous';
      shadowRoot.appendChild(googleFontLink2);
  
      const googleFontLink3 = document.createElement('link');
      googleFontLink3.rel = 'stylesheet';
      googleFontLink3.href = 'https://fonts.googleapis.com/css2?family=Chocolate+Classical+Sans&family=Figtree:ital,wght@0,300..900;1,300..900&family=Noto+Sans+TC:wght@100..900&display=swap';
      shadowRoot.appendChild(googleFontLink3);
  
      const customCSS = document.createElement('style');
      customCSS.type = 'text/css';
      customCSS.innerHTML = `
      *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
        :host {
          display: block;
          --inf-embedded-ad-font-9: 9px;
          --inf-embedded-ad-font-8: 8px;
          --inf-embedded-ad-font-12: 12px;
          --inf-embedded-ad-font-13: 13px;
          --inf-embedded-ad-font-14: 14px;
          --inf-embedded-ad-font-15: 15px;
          --inf-embedded-ad-font-16: 16px;
          --inf-embedded-ad-font-18: 18px;
          --inf-embedded-ad-font-21: 21px;
          --inf-embedded-ad-font-custom: 15px;
          --inf-embedded-ad-radius-8: 8px;
          --inf-embedded-ad-dark-yellow: rgba(59, 59, 50, 1);
          --inf-embedded-ad-dark-gray: #3B3B32;
          --inf-embedded-ad-dark-red: #EB7454;
          --inf-embedded-ad-light-gray: rgba(59, 59, 50, 0.30);
          --swiper-wrapper-transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1) !important;
        }
        #${containerId} #recommendation-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 200px;
          height: 100%;
        }
        @media (min-width: 480px) {
          #${containerId} #recommendation-loading {
            min-height: 250px;
          }
        }
        #${containerId} #recommendation-loading .loading-text {
          font-size: 14px;
          display: inline-block;
          letter-spacing: 2px;
          color: black;
          box-sizing: border-box;
          animation: animloader 1s ease-in infinite alternate;
        }
        @keyframes animloader {
          0% { filter: blur(0px); transform: skew(0deg); }
          100% { filter: blur(3px); transform: skew(-4deg); }
        }
        #${containerId} .infEmbeddedAdContainer {
          padding: 0px;
          margin: 0 auto;
          width: 100%;
          min-width: 100%;
          max-width: 100%;
          display: none;
          position: relative;
          width: fit-content;
        }
        #${containerId} .infEmbeddedAdContainer * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          #${containerId}:not(.small-container) .infEmbeddedAdContainer {
            padding: 16px 18px;
          }
        }
        #${containerId} .swiper-next,
        #${containerId} .swiper-prev,
        #${containerId} .swiper-next-corr,
        #${containerId} .swiper-prev-corr {
          display: none;
          cursor: pointer;
        }
        #${containerId} .swiper-next::after,
        #${containerId} .swiper-prev::after,
        #${containerId} .swiper-next-corr::after,
        #${containerId} .swiper-prev-corr::after {
          content: "";
        }
        @media (min-width: 768px) {
          #${containerId} .swiper-next,
          #${containerId} .swiper-prev,
          #${containerId} .swiper-next-corr,
          #${containerId} .swiper-prev-corr {
            display: block;
            position: absolute;
            top: 45%;
            z-index: 99;
          }
          #${containerId} .swiper-next,
          #${containerId} .swiper-next-corr {
            right: -28px;
          }
          #${containerId} .swiper-prev,
          #${containerId} .swiper-prev-corr {
            left: -28px;
          }
        }
        #${containerId} .title-navigation {
          display: inline-flex;
          align-items: center;
          margin-left: auto;
          column-gap: 8px;
        }
        #${containerId} .title-nav-prev,
        #${containerId} .title-nav-next {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0;
          background-color: transparent;
          box-shadow: none;
        }
        #${containerId} .title-nav-prev:hover,
        #${containerId} .title-nav-next:hover {
          opacity: 0.7;
        }
        #${containerId} .title-nav-prev img,
        #${containerId} .title-nav-next img {
          width: 18px;
          height: 18px;
        }
        @media (min-width: 768px) {
          #${containerId} .title-nav-prev img,
          #${containerId} .title-nav-next img {
            width: 20px;
            height: 20px;
          }
        }
        #${containerId} .infEmbeddedAdContainer a {
          text-decoration: none !important;
          color: inherit;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          font-weight: 500;
          font-style: normal;
          display: inline;
        }
        #${containerId} .infEmbeddedAdContainer a:hover,
        #${containerId} .infEmbeddedAdContainer a:visited,
        #${containerId} .infEmbeddedAdContainer a:link,
        #${containerId} .infEmbeddedAdContainer a:active {
          text-decoration: none;
        }
        #${containerId} .infEmbeddedAdContainer a:focus {
          outline: none;
        }
        #${containerId} .embeddedAdContainer__wrapper .embeddedAdContainer__title {
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          text-align: center;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          color: #000;
          font-size: var(--inf-embedded-ad-font-18);
          letter-spacing: 1.6px;
          text-align: left;
          margin: 0;
          padding: 0;
          margin-bottom: 12px;
        }
  
        @media (min-width: 768px) {
          #${containerId}:not(.small-container) .embeddedAdContainer__wrapper .embeddedAdContainer__title {
            margin-top: 0px;
            margin-bottom: 0px;
          }
        }
        @media (min-width: 1025px) {
          #${containerId}:not(.small-container) .embeddedAdContainer__wrapper .embeddedAdContainer__title {
            color: var(--inf-embedded-ad-dark-yellow), var(--inf-embedded-ad-dark-gray);
            font-size: 22px;
            letter-spacing: 0.84px;
            font-weight: 500;
            margin-top: 0px;
          }
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          width: 100%;
          justify-content: center;
          align-items: center;
          row-gap: 12px;
          padding: 0;
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img {
          position: relative;
          width: 100%;
          border-radius: 8px; /* 直接使用值，確保圓角生效 */
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__img--tag {
          position: absolute;
          top: 4px;
          left: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }
        @media (min-width: 768px) {
          #${containerId}:not(.small-container) .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__img--tag {
            top: 8px;
            left: 8px;
          }
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__img--tag div {
          z-index: 1;
          padding: 3px 4px;
          border-radius: 100px;
          background: rgba(59, 59, 50, 0.14);
          backdrop-filter: blur(3.5px);
          color: #F3F3EF;
          text-align: center;
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          font-size: var(--inf-embedded-ad-font-8);
          line-height: 11px;
          font-style: normal;
          font-weight: 400;
        }
        @media (min-width: 768px) {
          #${containerId}:not(.small-container) .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__img--tag div {
            padding: 5px 8px;
            font-size: var(--inf-embedded-ad-font-14);
            line-height: 17px;
          }
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__imgBox {
          width: 100%;
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          display: grid;
          place-items: center;
          border-radius: 8px; /* 直接使用值，確保圓角生效 */
          will-change: transform;
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__sizeTag {
          position: absolute;
          bottom: 3%;
          right: 3%;
          border-radius: 40px;
          background: rgba(255, 255, 255, 0.70);
          backdrop-filter: blur(6px);
          display: flex;
          padding: 3% 15%;
          justify-content: center;
          align-items: center;
          gap: 4px;
          z-index: 1;
          color: rgba(0, 0, 0, 0.95);
          font-family: Figtree;
          font-size: 15px;
          font-style: normal;
          font-weight: 500;
          line-height: 20px;
          letter-spacing: -0.12px;
        }
        @media (min-width: 768px) {
          #${containerId}:not(.small-container) .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__sizeTag {
            bottom: 12px;
            right: 12px;
            padding: 14px 20px;
            font-size: 17px;
            line-height: 22px;
            letter-spacing: -0.136px;
          }
        }
        #${containerId}:not(.small-container)  .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img img {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          margin: auto;
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform;
          border-radius: 8px; /* 直接使用值，確保圓角生效 */
        }
        #${containerId}:not(.small-container)  .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        @media (min-width: 768px) {
          #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo {
            gap: 2px;
          }
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__title {
          color: var(--inf-embedded-ad-dark-gray);
          text-align: center;
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          font-size: var(--inf-embedded-ad-font-12);
          font-style: normal;
          font-weight: 500;
          line-height: 18px;
          letter-spacing: 0.26px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      #${containerId} .embeddedAdContainer__wrapper{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0px;
      }
      #${containerId} .text-section {
          display: none; /* 初始隱藏，載入完成後顯示 */
          flex-direction: column;
          width: 100%;
          gap: 10px;
          align-items: center;
      }
  
      #${containerId} .text-section h2.embeddedAdContainer__title-v2 {
          color: #000;
          font-family: 'Noto Sans TC' Arial, sans-serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 39px;
          letter-spacing: 0.64px;
          white-space: pre-wrap;
      }
  
      #${containerId} .text-section p {
          color: rgba(0, 0, 0, 0.8);
          font-family: 'Noto Sans TC' Arial, sans-serif;
          font-size: 17px;
          font-weight: 300;
          line-height: 22px;
          letter-spacing: 0.34px;
          text-align: center;
      }
        @media (min-width: 768px) {
        #${containerId} .embeddedAdContainer__wrapper:has(.embeddedAdContainer__title-v2){
          gap: 64px;
        }
        #${containerId} .text-section {
          gap: 24px;
        }
  
       #${containerId} .text-section h2.embeddedAdContainer__title-v2 {
          color: #1e1e19;
          text-align: center;
          font-size: 51px;
          line-height: 56px;
          letter-spacing: 1.02px;
        }
  
       #${containerId} .text-section p {
          color: #787974;
          text-align: center;
          font-size: 28px;
          font-weight: 400;
          line-height: 33px;
          letter-spacing: -0.56px;
        }
      }
        @media (min-width: 768px) {
          #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__title {
            font-size: var(--inf-embedded-ad-font-custom);
            line-height: 23px;
            letter-spacing: 0.36px;
          }
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__price--original {
          color: var(--inf-embedded-ad-dark-red);
          text-align: center;
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: 17px;
        }
        @media (min-width: 768px) {
          #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__price--original {
            font-size: var(--inf-embedded-ad-font-custom);
            line-height: 23px;
          }
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 2px;
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__discount {
          color: #eb7454;
          background: white;
          border: 1px solid #eb7454;
          padding: 0 4px;
          border-radius: 5px;
          font-size: 12px;
          opacity: 1;
          transform: scale(0.8);
          text-wrap-mode: nowrap;
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__sptext {
          color: #333;
          background: white;
          padding: 0 4px;
          border-radius: 5px;
          font-size: 12px;
          opacity: 1;
          text-align: center;
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price {
          margin-right: 8px;
          color: var(--inf-embedded-ad-dark-red);
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          font-size: var(--inf-embedded-ad-font-12);
          font-style: normal;
          font-weight: 500;
          line-height: 17px;
          text-wrap-mode: nowrap;
        }
        @media (min-width: 768px) {
          #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price {
            font-size: var(--inf-embedded-ad-font-custom);
            line-height: 23px;
          }
        }
        #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price--original {
          color: var(--inf-embedded-ad-light-gray);
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          font-size: var(--inf-embedded-ad-font-9);
          font-weight: 500;
          line-height: 14px;
        }
        @media (min-width: 768px) {
          #${containerId} .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price--original {
            font-size: var(--inf-embedded-ad-font-12);
            line-height: 17px;
          }
        }
        #${containerId} .infEmbeddedAdContainer .swiper-slide {
          -webkit-backface-visibility: hidden;
          -webkit-transform: translate3d(0,0,0);
        }
        #${containerId} .infEmbeddedAdContainer .swiper-wrapper {
          -webkit-transform-style: preserve-3d;
          height: fit-content;
          max-height: fit-content;
        }
        #${containerId} .swiper-slide {
          will-change: transform;
        }
        #${containerId} {
          font-family: 'Figtree', 'Noto Sans TC', "微軟正黑體", sans-serif;
          -webkit-font-smoothing: auto;
        }
        #${containerId}.small-container {
          padding: 8px;
        }
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdContainer__title {
          font-size: 16px;
        }
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem {
          row-gap: 8px;
        }
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__title,
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__price--original,
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price,
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price--original {
          font-size: 12px;
          line-height: 16px;
        }
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__price--original,
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price,
        #${containerId}.small-container .infEmbeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price--original {
          text-wrap-mode: nowrap;
        }
      `;
      shadowRoot.appendChild(customCSS);
  
      $(() => {
        let ids = this.ids_init(skuContentType || skuContent || 'shopline_sku'); // 修改：傳遞 skuContentType 或 skuContent
  
        const embeddedContainer = `
        <div class="embeddedAdContainer__wrapper">
             <div class="text-section">
               <h2 class="${description && false ? 'embeddedAdContainer__title-v2' : 'embeddedAdContainer__title'}">${title}</h2>
               ${description && false ? `<p class="embeddedAdContainer__desc">${description}</p>` : ''}
             </div>
          <div class="infEmbeddedAdContainer" id="embedded-ad-container-${containerId}">
            <div style="margin-bottom: 6px;">
              <div class="title-navigation" style="width: 100%;justify-content: flex-end">
                <div class="title-nav-prev">
                  <img src="https://raw.githubusercontent.com/infFITSDevelopment/pop-ad/refs/heads/main/slide-arrow-left.svg" />
                </div>
                <div class="title-nav-next">
                  <img src="https://raw.githubusercontent.com/infFITSDevelopment/pop-ad/refs/heads/main/slide-arrow-right.svg" />
                </div>
              </div>
            </div>
            <div class="embeddedAdImgContainer carouselContainer swiper swiper-basic-${containerId}" style="overflow: hidden;">
              <div class="swiper-wrapper" id="swiper-wrapper-basic-${containerId}"></div>
            </div>
            <div class="swiper-next a-right">
              <img src="https://raw.githubusercontent.com/infFITSDevelopment/pop-ad/refs/heads/main/slide-arrow-right.svg" />
            </div>
            <div class="swiper-prev a-left">
              <img src="https://raw.githubusercontent.com/infFITSDevelopment/pop-ad/refs/heads/main/slide-arrow-left.svg" />
            </div>
          </div>
          </div>
        `;
  
        $(shadowRoot.querySelector(show_up_position_before)).append(embeddedContainer);
  
        $(window).resize(() => {
          const newContainerWidth = $(shadowRoot.querySelector(show_up_position_before)).width();
          if (arrowPosition === 'none') {
            $(shadowRoot.querySelector(`#${containerId} .swiper-next`)).css('display', 'none');
            $(shadowRoot.querySelector(`#${containerId} .swiper-prev`)).css('display', 'none');
            $(shadowRoot.querySelector(`#${containerId} .swiper-next-corr`)).css('display', 'none');
            $(shadowRoot.querySelector(`#${containerId} .swiper-prev-corr`)).css('display', 'block');
            $(shadowRoot.querySelector(`#${containerId} .title-navigation`)).css('display', 'none');
          } else {
            if (arrowPosition === 'center' && newContainerWidth >= 768) {
              $(shadowRoot.querySelector(`#${containerId} .swiper-next`)).css('display', 'block');
              $(shadowRoot.querySelector(`#${containerId} .swiper-prev`)).css('display', 'block');
              $(shadowRoot.querySelector(`#${containerId} .swiper-next-corr`)).css('display', 'block');
              $(shadowRoot.querySelector(`#${containerId} .swiper-prev-corr`)).css('display', 'block');
              $(shadowRoot.querySelector(`#${containerId} .title-navigation`)).css('display', 'none');
            } else {
              $(shadowRoot.querySelector(`#${containerId} .swiper-next`)).css('display', 'none');
              $(shadowRoot.querySelector(`#${containerId} .swiper-prev`)).css('display', 'none');
              $(shadowRoot.querySelector(`#${containerId} .swiper-next-corr`)).css('display', 'none');
              $(shadowRoot.querySelector(`#${containerId} .swiper-prev-corr`)).css('display', 'none');
              $(shadowRoot.querySelector(`#${containerId} .title-navigation`)).css('display', 'inline-flex');
            }
          }
          $(shadowRoot.querySelector(show_up_position_before))
            .css('padding', customPadding ? customPadding : newContainerWidth >= 768 ? '32px' : '8px')
            .toggleClass('small-container', newContainerWidth < 768);
          if (customPadding) {
            $(shadowRoot.querySelector(`#${containerId}.small-container`)).css('padding', customPadding);
          }
        });
  
        const containerWidth = $(shadowRoot.querySelector(show_up_position_before)).width();
        $(shadowRoot.querySelector(show_up_position_before))
          .css('padding', customPadding ? customPadding : containerWidth >= 768 ? '32px' : '8px')
          .toggleClass('small-container', containerWidth < 768);
        if (customPadding) {
          $(shadowRoot.querySelector(`#${containerId}.small-container`)).css('padding', customPadding);
        }
  
        if (arrowPosition === 'none') {
          $(shadowRoot.querySelector(`#${containerId} .swiper-next`)).css('display', 'none');
          $(shadowRoot.querySelector(`#${containerId} .swiper-prev`)).css('display', 'none');
          $(shadowRoot.querySelector(`#${containerId} .swiper-next-corr`)).css('display', 'none');
          $(shadowRoot.querySelector(`#${containerId} .swiper-prev-corr`)).css('display', 'block');
          $(shadowRoot.querySelector(`#${containerId} .title-navigation`)).css('display', 'none');
        } else {
          if (arrowPosition === 'center' && containerWidth >= 768) {
            $(shadowRoot.querySelector(`#${containerId} .swiper-next`)).css('display', 'block');
            $(shadowRoot.querySelector(`#${containerId} .swiper-prev`)).css('display', 'block');
            $(shadowRoot.querySelector(`#${containerId} .swiper-next-corr`)).css('display', 'block');
            $(shadowRoot.querySelector(`#${containerId} .swiper-prev-corr`)).css('display', 'block');
            $(shadowRoot.querySelector(`#${containerId} .title-navigation`)).css('display', 'none');
          } else {
            $(shadowRoot.querySelector(`#${containerId} .swiper-next`)).css('display', 'none');
            $(shadowRoot.querySelector(`#${containerId} .swiper-prev`)).css('display', 'none');
            $(shadowRoot.querySelector(`#${containerId} .swiper-next-corr`)).css('display', 'none');
            $(shadowRoot.querySelector(`#${containerId} .swiper-prev-corr`)).css('display', 'none');
            $(shadowRoot.querySelector(`#${containerId} .title-navigation`)).css('display', 'inline-flex');
          }
        }
  
        // 樣式載入完成後，顯示 loading 並開始載入推薦內容
        this.showLoadingAndLoadAds(ids, containerId, {
          brand,
          customEdm,
          hide_discount,
          hide_size,
          series_out,
          series_in,
          ctype_val,
          bid,
          autoplay,
          sortedBreakpoints,
          displayMode,
          recommendMode,
          carouselType: config.carouselType || 'product' // 添加 carousel 類型
        });
  
        $(shadowRoot).on('click', `#${containerId} .embeddedItem`, function() {
          const title = $(this).data('title');
          const link = $(this).data('link');
          gtag('event', 'click_embedded_item' + test, {
            send_to: GA4Key,
            event_category: 'embedded',
            event_label: title,
            event_value: link
          });
        });
  
        $(shadowRoot).on('click', `#${containerId} .a-left`, function() {
          if (typeof gtag === 'function') {
            gtag('event', 'click_embedded_item' + test, {
              send_to: GA4Key,
              event_category: 'embedded',
              event_label: 'arrow-left',
              event_value: 'left'
            });
          }
        });
  
        $(shadowRoot).on('click', `#${containerId} .a-right`, function() {
          if (typeof gtag === 'function') {
            gtag('event', 'click_embedded_item' + test, {
              send_to: GA4Key,
              event_category: 'embedded',
              event_label: 'arrow-right',
              event_value: 'right'
            });
          }
        });
        $(shadowRoot).on('click', `#${containerId} #swiper-wrapper-corr .embeddedItem`, function() {
          const title = $(this).data('title');
          const link = $(this).data('link');
          gtag('event', 'corr_click_embedded_item' + test, {
            send_to: GA4Key,
            event_category: 'swiper-wrapper-corr-embedded',
            event_label: 'Title: ' + title,
            value: link.length
          });
        });
  
        $(shadowRoot).on('click', `#${containerId} #swiper-wrapper-corr .a-left`, function() {
          gtag('event', 'corr_click_embedded_item' + test, {
            send_to: GA4Key,
            event_category: 'swiper-wrapper-corr-embedded',
            event_label: 'arrow-left',
            value: 10
          });
        });
  
        $(shadowRoot).on('click', `#${containerId} #swiper-wrapper-corr .a-right`, function() {
          gtag('event', 'corr_click_embedded_item' + test, {
            send_to: GA4Key,
            event_category: 'swiper-wrapper-corr-embedded',
            event_label: 'arrow-right',
            value: 10
          });
        });
  
        $(shadowRoot).on('click', `#${containerId} #swiper-wrapper-basic .embeddedItem`, function() {
          const title = $(this).data('title');
          const link = $(this).data('link');
          gtag('event', 'bhv_click_embedded_item' + test, {
            send_to: GA4Key,
            event_category: 'swiper-wrapper-basic-embedded',
            event_label: 'Title: ' + title,
            value: link.length
          });
        });
  
        $(shadowRoot).on('click', `#${containerId} #swiper-wrapper-basic .a-left`, function() {
          gtag('event', 'bhv_click_embedded_item' + test, {
            send_to: GA4Key,
            event_category: 'swiper-wrapper-basic-embedded',
            event_label: 'arrow-left',
            value: 10
          });
        });
  
        $(shadowRoot).on('click', `#${containerId} #swiper-wrapper-basic .a-right`, function() {
          gtag('event', 'bhv_click_embedded_item' + test, {
            send_to: GA4Key,
            event_category: 'swiper-wrapper-basic-embedded',
            event_label: 'arrow-right',
            value: 10
          });
        });
      });
    }
  
    ids_init(skuContentType = 'shopline_sku') {
      const makeid = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      };

      let member_id = this.member_id_Shopline();
      let lgiven_id = '';
      let lgvid_exist = false;

      try {
        if (typeof localStorage['LGVID'] !== 'undefined') {
          lgvid_exist = true;
        }
      } catch (e) {
        lgvid_exist = false;
      }

      if (lgvid_exist) {
        lgiven_id = localStorage['LGVID'];
      } else {
        lgiven_id = makeid(20);
        localStorage.setItem('LGVID', lgiven_id);
      }

      // 修改：根據 skuContentType 參數選擇對應的方法
      // 如果 skuContentType 是具體的數值，直接使用；否則根據類型選擇對應的方法
      const skuContentValue = (typeof skuContentType === 'string' && skuContentType !== 'app91_sku' && skuContentType !== 'shopline_sku') 
        ? skuContentType 
        : (skuContentType === 'app91_sku' ? this.app91_sku() : this.shopline_sku());

      return {
        member_id,
        lgiven_id,
        skuContent: skuContentValue
      };
    }
    
    showLoadingAndLoadAds(ids, containerId, config) {
      const $ = jQuery;
      const shadowRoot = this.shadowRoot;
      
      // 顯示 loading 元素
      const loadingElement = shadowRoot.querySelector(`#${containerId} #recommendation-loading`);
      if (loadingElement) {
        $(loadingElement).fadeIn(300);
      }
      
      // 開始載入推薦內容
      this.getEmbeddedAds(ids, containerId, config);
    }
  
    getEmbeddedAds(ids, containerId, config) {
      const { brand, customEdm, hide_discount, hide_size,series_out, series_in, ctype_val, bid, autoplay, sortedBreakpoints, displayMode, carouselType, recommendMode } = config;
      
      // 如果是彈窗類型，監聽重新載入事件
      if (carouselType === 'popup') {
        document.addEventListener('popup-reload-recommendations', (event) => {
          // console.log('收到重新載入事件，重新調用 API');
          const newBid = event.detail?.newBid;
          
          // 如果有新的 bid 配置，創建更新後的 config
          let updatedConfig = config;
          if (newBid && typeof newBid === 'object') {
            updatedConfig = {
              ...config,
              bid: newBid  // 完全覆蓋原始 bid 配置
            };
            console.log('使用新的 bid 配置重新載入推薦：', newBid);
          }
          
          this.fetchRecommendations(ids, containerId, updatedConfig);
        });
      }
      
      // 調用實際的推薦資料獲取函數
      this.fetchRecommendations(ids, containerId, config);
    }
    
    // 生成快取 key 的函數
    generateCacheKey(carouselType) {
      // 根據輪播類型和當前頁面路徑生成唯一的快取 key
      const pathname = location.pathname.toLowerCase();
      const key = `inf_carousel_cache_${carouselType}_${pathname.replace(/\//g, '_')}`;
      return key;
    }

    // 從 localStorage 獲取快取資料
    getCachedData(cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) {
          return null;
        }

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const cacheExpiry = 10 * 60 * 1000; // 10 分鐘（毫秒）

        // 檢查快取是否過期
        if (now - timestamp > cacheExpiry) {
          // 快取已過期，移除舊快取
          localStorage.removeItem(cacheKey);
          return null;
        }

        // console.log('使用快取資料，剩餘有效時間：', Math.floor((cacheExpiry - (now - timestamp)) / 1000), '秒');
        return data;
      } catch (error) {
        console.error('讀取快取時發生錯誤:', error);
        return null;
      }
    }

    // 將資料保存到 localStorage（實現 LRU 策略，最多保存 5 筆，僅處理推薦商品快取）
    setCachedData(cacheKey, data) {
      try {
        const maxCacheItems = 5; // 最多保存 5 筆快取
        
        // 只處理推薦商品快取（品牌配置不再快取）
        const isCarouselCache = cacheKey.startsWith('inf_carousel_cache_');
        
        if (isCarouselCache) {
          // 獲取推薦商品快取
          const prefix = 'inf_carousel_cache_';
          const keys = Object.keys(localStorage);
          const samePrefixCaches = [];
          
          keys.forEach(key => {
            if (key.startsWith(prefix)) {
              try {
                const cached = JSON.parse(localStorage.getItem(key));
                if (cached && cached.timestamp) {
                  samePrefixCaches.push({
                    key: key,
                    timestamp: cached.timestamp
                  });
                }
              } catch (e) {
                // 解析失敗的快取，稍後清理
              }
            }
          });
          
          // 檢查是否已存在相同的 key（更新情況）
          const existingIndex = samePrefixCaches.findIndex(cache => cache.key === cacheKey);
          const isUpdate = existingIndex !== -1;
          
          // 如果是新增且已達到上限，刪除最舊的快取
          if (!isUpdate && samePrefixCaches.length >= maxCacheItems) {
            // 按 timestamp 排序，找出最舊的
            samePrefixCaches.sort((a, b) => a.timestamp - b.timestamp);
            
            // 刪除最舊的快取
            const oldestCache = samePrefixCaches[0];
            localStorage.removeItem(oldestCache.key);
            // console.log(`已刪除最舊的推薦商品快取: ${oldestCache.key}`);
          }
        }
        
        // 保存新快取
        const cacheData = {
          data: data,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        // console.log('已將推薦商品資料保存到快取');
      } catch (error) {
        console.error('保存快取時發生錯誤:', error);
        // localStorage 可能已滿或不可用，靜默失敗
      }
    }

    // 清理所有過期的快取（包含舊的品牌配置快取）
    cleanupExpiredCache() {
      try {
        const keys = Object.keys(localStorage);
        const carouselPrefix = 'inf_carousel_cache_';
        const oldConfigPrefix = 'inf_brand_config_cache_'; // 舊的品牌配置快取
        const cacheExpiry = 10 * 60 * 1000; // 10 分鐘
        const now = Date.now();
        let cleanedCount = 0;

        keys.forEach(key => {
          if (key.startsWith(oldConfigPrefix)) {
            // 清理舊的品牌配置快取
            localStorage.removeItem(key);
            cleanedCount++;
            // console.log(`已清理舊的品牌配置快取: ${key}`);
          } else if (key.startsWith(carouselPrefix)) {
            // 處理推薦商品快取
            try {
              const cached = JSON.parse(localStorage.getItem(key));
              if (cached && cached.timestamp) {
                // 檢查是否過期
                if (now - cached.timestamp > cacheExpiry) {
                  localStorage.removeItem(key);
                  cleanedCount++;
                  // console.log(`已清理過期的推薦商品快取: ${key}`);
                }
              } else {
                // 格式不正確的快取也清理掉
                localStorage.removeItem(key);
                cleanedCount++;
              }
            } catch (e) {
              // 解析失敗的快取也清理掉
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        });

        if (cleanedCount > 0) {
          // console.log(`已清理 ${cleanedCount} 個過期或無效的快取項目`);
        }
      } catch (error) {
        console.error('清理過期快取時發生錯誤:', error);
      }
    }

    // 實際的推薦資料獲取函數
    fetchRecommendations(ids, containerId, config) {
      const { brand, customEdm, hide_discount, hide_size, series_out, series_in, ctype_val, bid, autoplay, sortedBreakpoints, displayMode, carouselType, recommendMode } = config;
      
      // 檢查 localStorage 中的 BodyID_Foot_size，如果存在則更新 bid 的 HV 和 WV
      try {
        const bodyIdFootSize = localStorage.getItem('BodyID_Foot_size');
        if (bodyIdFootSize && bid) {
          console.log('[InfCarousel] 偵測到 localStorage 中的 BodyID_Foot_size:', bodyIdFootSize);
          console.log('[InfCarousel] 原始 bid:', JSON.stringify(bid));
          
          // 解析 BodyID_Foot_size (假設格式為 JSON)
          try {
            const footSizeData = JSON.parse(bodyIdFootSize);
            
            // 更新 bid 的 HV 和 WV
            if (footSizeData.HV !== undefined) {
              bid.HV = footSizeData.HV;
              console.log('[InfCarousel] 已更新 bid.HV 為:', footSizeData.HV);
            }
            if (footSizeData.WV !== undefined) {
              bid.WV = footSizeData.WV;
              console.log('[InfCarousel] 已更新 bid.WV 為:', footSizeData.WV);
            }
            
            console.log('[InfCarousel] 更新後的 bid:', JSON.stringify(bid));
          } catch (parseError) {
            console.warn('[InfCarousel] 解析 BodyID_Foot_size 失敗:', parseError);
          }
        } else if (bodyIdFootSize) {
          console.log('[InfCarousel] BodyID_Foot_size 存在但 bid 不存在');
        }
      } catch (error) {
        console.error('[InfCarousel] 檢查 BodyID_Foot_size 時發生錯誤:', error);
      }
      
      // 如果是重置推薦，先隱藏當前內容並顯示 loading
      if (window.resetRecomCalled) {
        // 隱藏標題區域
        const textSection = this.shadowRoot.querySelector(`#${containerId} .text-section`);
        if (textSection) {
          $(textSection).hide();
        }
        
        // 隱藏輪播容器
        const embeddedContainer = this.shadowRoot.querySelector(`#${containerId} .infEmbeddedAdContainer`);
        if (embeddedContainer) {
          $(embeddedContainer).hide();
        }
        
        // 顯示 loading
        const loadingElement = this.shadowRoot.querySelector(`#${containerId} #recommendation-loading`);
        if (loadingElement) {
          $(loadingElement).show();
        }
      }

      // 生成快取 key
      const cacheKey = this.generateCacheKey(carouselType);
      
      // 檢查是否有有效的快取資料
      const cachedResponse = this.getCachedData(cacheKey);
      if (cachedResponse) {
        // 使用快取資料，直接處理並顯示
        this.processFetchedData(cachedResponse, ids, containerId, config, cacheKey);
        return;
      }
      
      // 調試日誌：確認 displayMode 的值
      // console.log('getEmbeddedAds - displayMode:', displayMode);
      // console.log('getEmbeddedAds - 完整配置:', config);
      const requestData = brand.toLocaleUpperCase() === 'DABE' ? {
        Brand: brand,
        LGVID: ids.lgiven_id,
        MRID: ids.member_id,
        recom_num: "10",
        series_out: "[\"成長型\"]",
        PID: ids.skuContent,
        SP_PID: "xxSOCIAL PROOF",
        SIZEAI_ptr: "bhv,corr,sp_atc,sp_trans"||"bhv"
        // SIZEAI_ptr: recommendMode||"bhv"
        
      } : {
        Brand: brand,
        LGVID: ids.lgiven_id,
        MRID: ids.member_id,
        recom_num: '10',
        PID: ids.skuContent,
        SP_PID: "xxSOCIAL PROOF",
        SIZEAI_ptr: "bhv,corr,sp_atc,sp_trans"||"bhv"
        // SIZEAI_ptr: recommendMode||"bhv"
      };
      bid.Brand = brand;
  
      if (ctype_val && ctype_val.length > 0) {
        requestData.ctype_val = JSON.stringify(ctype_val);
      }
  
      if (!hide_size) {
        // requestData.SIZEAI = 'True';
      }
      if (bid && brand.toLocaleUpperCase() !== 'DABE') {
        requestData.SIZEAI = 'True';
        requestData.bid = bid;
      }
      if (series_out) {
        requestData.series_out = series_out;
      }
      if (series_in) {
        requestData.series_in = series_in;
      }
  
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestData)
      };
  
      const getRandomElements = (arr, count) => {
        const result = [];
        const usedIndexes = new Set();
        while (result.length < count) {
          const randomIndex = Math.floor(Math.random() * arr.length);
          if (!usedIndexes.has(randomIndex)) {
            result.push(arr[randomIndex]);
            usedIndexes.add(randomIndex);
          }
        }
        return result;
      };
  
      // 根據 carouselType 決定使用不同的 API URL 和選項
      // console.log('getEmbeddedAds - carouselType:', carouselType);
      let apiUrl, fetchOptions;
      
      if (carouselType === 'popup') {
        bid.Brand = 'CLARKS';
        // popup 類型使用特殊的 URL 和選項
        apiUrl = 'https://api.inffits.com/HTTP_pidinfo_cdp_product_recommendation/extension/recom_product';
        const requestPopupData = {
          Brand: "CLARKS",
          LGVID: "x",
          MRID: "",
          recom_num: "6",
          PID:  document.location.href.includes('SalePage/Index/')?document.location.href.split('?')[0].split('/SalePage/Index/')[1]:'10662339',
          SP_PID: "xxSOCIAL PROOF", // FIXME
          SIZEAI_ptr: recommendMode||"bhv",
        }
        if (!hide_size) {
          // requestPopupData.SIZEAI = 'True';
        }
        if (bid) {
          requestPopupData.SIZEAI = 'True';
          requestPopupData.bid = bid;
        }
        fetchOptions = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify(requestPopupData)
        };
        
        // 輸出 popup 模式的 API 請求資料，方便排查
        console.log('[InfCarousel] Popup API 請求 URL:', apiUrl);
        console.log('[InfCarousel] Popup API 請求資料:', JSON.stringify(requestPopupData, null, 2));

      } else {
        // product 類型保持原本的配置
        const hasSeriesParams = !!series_out || !!series_in;
        const api_recom_product_url = brand.toLocaleUpperCase() === 'DABE' || hasSeriesParams ? 'HTTP_stock_cdp_product_recommendation' : 'HTTP_inf_alpha_bhv_cdp_product_recommendation';
        apiUrl = `https://api.inffits.com/${api_recom_product_url}/extension/recom_product`;
        fetchOptions = options;
        
        // 輸出 product 模式的 API 請求資料，方便排查
        console.log('[InfCarousel] Product API 請求 URL:', apiUrl);
        console.log('[InfCarousel] Product API 請求資料:', JSON.stringify(requestData, null, 2));
      }

      fetch(apiUrl, fetchOptions)
        .then(response => {
          // 檢查 HTTP 狀態碼，如果是錯誤狀態碼（如 500），則拋出錯誤
          if (!response.ok) {
            throw new Error(`API 調用失敗: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(response => {
          // 保存到快取
          this.setCachedData(cacheKey, response);
          
          // 處理並顯示資料
          this.processFetchedData(response, ids, containerId, config, cacheKey);
        })
        .catch(err => {
          console.error('API 調用錯誤:', err);
          // 當 API 調用失敗時，隱藏 loading 但不顯示 popup
          $(this.shadowRoot.querySelector(`#${containerId} #recommendation-loading`)).fadeOut(400, () => {
            // 不顯示 popup，因為 API 調用失敗
            // console.log('API 調用失敗，不顯示 popup');
          });
          if (containerId === 'personalized-recommendations') {
            $('#jump-recom').hide();
          }
          if (containerId === 'more-recommendations') {
            $('#jump-more').hide();
          }
        });
    }

    // 處理獲取到的資料（無論是從快取還是 API）
    processFetchedData(response, ids, containerId, config, cacheKey) {
      const { brand, customEdm, hide_discount, hide_size, series_out, series_in, ctype_val, bid, autoplay, sortedBreakpoints, displayMode, carouselType, recommendMode } = config;
      
      // 定義 getRandomElements 函數
      const getRandomElements = (arr, count) => {
        const result = [];
        const usedIndexes = new Set();
        while (result.length < count) {
          const randomIndex = Math.floor(Math.random() * arr.length);
          if (!usedIndexes.has(randomIndex)) {
            result.push(arr[randomIndex]);
            usedIndexes.add(randomIndex);
          }
        }
        return result;
      };
      
      // 從這裡開始是原本 fetch then 中的邏輯
      let size_tag = {};

      if (response['SIZEAI_result'] && !response['SIZEAI_result'].error) {
        size_tag = response['SIZEAI_result'].reduce((acc, item) => {
          if (item && item.ITEM && typeof item.ITEM === 'string' && item.ITEM !== '{}') {
            try {
              const itemScores = JSON.parse(item.ITEM);
              if (itemScores && Object.keys(itemScores).length > 0) {
                const bestSize = Object.entries(itemScores)
                  .map(([size, percent]) => [size, parseFloat(percent)])
                  .sort((a, b) => b[1] - a[1])[0][0];
                acc[item.productid] = bestSize;
              }
            } catch (error) {
              console.error(`Error parsing ITEM for productid ${item.productid}:`, error);
            }
          }
          return acc;
        }, {});
        
        if (response['bhv']) {
          response['bhv'].forEach(item => {
            item.size_tag = size_tag[item.id];
          });
        }
        if (response['corr']) {
          response['corr'].forEach(item => {
            item.size_tag = size_tag[item.id];
          });
        }
        if (response['sp_atc']) {
          response['sp_atc'].forEach(item => {
            item.size_tag = size_tag[item.id];
          });
        }
        if (response['sp_trans']) {
          response['sp_trans'].forEach(item => {
            item.size_tag = size_tag[item.id];
          });
        }
      }

      // 根據 displayMode 決定資料取用順序
      let jsonData = [];
      
      if (customEdm && customEdm.length > 0) {
        // 如果有自定義 EDM 資料，優先使用
        jsonData = customEdm.map(item => {
          let newItem = Object.assign({}, item);
          newItem.sale_price = hide_discount ? null : item.sale_price ? parseInt(item.sale_price.replace(/\D/g, '')).toLocaleString() : '';
          newItem.price = parseInt(item.price.replace(/\D/g, '')).toLocaleString();
          return newItem;
        });
      } else {
        // 使用配置中的 recommendMode 替代 fetchOptions.body
        const sizeAiPtrValid = recommendMode ? recommendMode.split(',').map(s => s.trim()) : ['bhv'];
        // 根據 displayMode 決定資料來源順序
        if (displayMode === 'SaleRate') {
          // SaleRate 模式：優先使用 bhv 或 corr，然後是 sp_atc 或 sp_trans
          let sourceData = [];
          
          // 優先取用 bhv 或 corr（需檢查是否在 sizeAiPtrValid 中）
          if (sizeAiPtrValid.includes('bhv') && response['bhv'] && response['bhv'].length > 0) {
            sourceData = response['bhv'];
          } else if (sizeAiPtrValid.includes('corr') && response['corr'] && response['corr'].length > 0) {
            sourceData = response['corr'];
          }
          
          // 如果 bhv 和 corr 都沒有資料，則使用 sp_atc 或 sp_trans（需檢查是否在 sizeAiPtrValid 中）
          if (sourceData.length === 0) {
            if ((sizeAiPtrValid.includes('sp_atc') || sizeAiPtrValid.includes('sp_atc_sp_trans')) && response['sp_atc'] && response['sp_atc'].length > 0) {
              sourceData = response['sp_atc'];
            } else if ((sizeAiPtrValid.includes('sp_trans') || sizeAiPtrValid.includes('sp_atc_sp_trans')) && response['sp_trans'] && response['sp_trans'].length > 0) {
              sourceData = response['sp_trans'];
            }
          }
          
          // 處理資料並限制數量
          if (sourceData.length > 0) {
            jsonData = getRandomElements(sourceData, sourceData.length > 12 ? 12 : sourceData.length).map(item => {
              let newItem = Object.assign({}, item);
              newItem.sale_price = hide_discount ? null : item.sale_price ? parseInt(item.sale_price.replace(/\D/g, '')).toLocaleString() : '';
              newItem.price = parseInt(item.price.replace(/\D/g, '')).toLocaleString();
              return newItem;
            });
          }
        } else if (displayMode === 'SocialProofNum') {
          // SocialProofNum 模式：只使用 sp_atc 或 sp_trans，不使用 bhv 或 corr（需檢查是否在 sizeAiPtrValid 中）
          let sourceData = [];
          
          if ((sizeAiPtrValid.includes('sp_atc') || sizeAiPtrValid.includes('sp_atc_sp_trans')) && response['sp_atc'] && response['sp_atc'].length > 0) {
            sourceData = response['sp_atc'];
          } else if ((sizeAiPtrValid.includes('sp_trans') || sizeAiPtrValid.includes('sp_atc_sp_trans'))  && response['sp_trans'] && response['sp_trans'].length > 0) {
            sourceData = response['sp_trans'];
          }
          // 處理資料並限制數量
          if (sourceData.length > 0) {
            jsonData = getRandomElements(sourceData, sourceData.length > 12 ? 12 : sourceData.length).map(item => {
              let newItem = Object.assign({}, item);
              newItem.sale_price = hide_discount ? null : item.sale_price ? parseInt(item.sale_price.replace(/\D/g, '')).toLocaleString() : '';
              newItem.price = parseInt(item.price.replace(/\D/g, '')).toLocaleString();
              return newItem;
            });
          }
        } else {
          // 其他模式：使用預設的 bhv 資料（需檢查是否在 sizeAiPtrValid 中）
          if (sizeAiPtrValid.includes('bhv') && response['bhv'] && response['bhv'].length > 0) {
            jsonData = getRandomElements(response['bhv'], response['bhv'].length > 12 ? 12 : response['bhv'].length).map(item => {
              let newItem = Object.assign({}, item);
              newItem.sale_price = hide_discount ? null : item.sale_price ? parseInt(item.sale_price.replace(/\D/g, '')).toLocaleString() : '';
              newItem.price = parseInt(item.price.replace(/\D/g, '')).toLocaleString();
              return newItem;
            });
          }
        }
      }

      if (jsonData.length > 0) {
        this.updatePopAd(jsonData, containerId, autoplay, sortedBreakpoints, displayMode, hide_size, hide_discount);
      } else {
        $(this.shadowRoot.querySelector(`#${containerId} #recommendation-loading`)).fadeOut(400, () => {
          // sourceData 為空時不顯示 popup
          // console.log('sourceData 為空，不顯示 popup');
        });
        if (containerId === 'personalized-recommendations') {
          $('#jump-recom').hide();
        }
        if (containerId === 'more-recommendations') {
          $('#jump-more').hide();
        }
      }
    }
  
    updatePopAd(images, containerId, autoplay, sortedBreakpoints, displayMode, hide_size, hide_discount) {
      // 調試日誌：確認 updatePopAd 中的 displayMode 值
      // console.log('updatePopAd - displayMode:', displayMode);
      
      let displayImages = images;
      
      // 動態調整 Swiper 配置以處理項目數量不足的問題
      const adjustedBreakpoints = this.adjustSwiperConfigForInsufficientItems(sortedBreakpoints, images.length);
      
             // 檢查是否已經存在 Swiper 實例（重置推薦時只更新內容）
       // 修復：當組件被 append 到外部容器時，需要從外部 DOM 查找元素
       // 使用更靈活的選擇器，不依賴特定的 containerId
       const swiperElement = this.shadowRoot.querySelector(`.swiper-basic-${containerId}`) || 
                            document.querySelector(`.swiper-basic-${containerId}`) ||
                            this.shadowRoot.querySelector('[class*="swiper-basic-"]') ||
                            document.querySelector('[class*="swiper-basic-"]');
       
       if (!swiperElement) {
         console.error(`找不到 Swiper 元素，containerId: ${containerId}`);
         return;
       }
      
      const existingSwiper = swiperElement.swiper;
      const isResetRecom = window.resetRecomCalled;
  
      if (images.length === 0) {
        displayImages = [{
          link: '#',
          title: '暫無商品',
          image_link: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4=',
          description: '暫無商品',
          price: '0',
          sale_price: null
        }];
      }
      
      // 如果需要添加額外的項目，則添加它們
      if (this.needsMoreSlides && this.additionalSlidesCount > 0) {
        if (this.slideGenerationStrategy === 'duplicate' && displayImages.length > 0) {
          // 使用更聰明的重複策略
          const originalItems = [...displayImages];
          const originalCount = originalItems.length;
          
          // 計算需要重複多少輪才能達到目標數量
          const totalNeeded = originalCount + this.additionalSlidesCount;
          const rounds = Math.ceil(totalNeeded / originalCount);
          
          // 重複原始項目直到達到所需數量
          for (let round = 1; round < rounds; round++) {
            for (let i = 0; i < originalCount && displayImages.length < totalNeeded; i++) {
              const sourceItem = originalItems[i];
              displayImages.push({
                ...sourceItem,
                isDuplicateSlide: true,
                duplicateRound: round, // 標記是第幾輪重複
                originalIndex: i // 標記原始索引
              });
            }
          }
          
          // console.log(`已重複添加項目，總項目數：${displayImages.length}，重複輪數：${rounds - 1}`);
          
        } else if (this.slideGenerationStrategy === 'blank') {
          // 添加空白項目，但確保它們有足夠的變化來避免 Swiper 混淆
          for (let i = 0; i < this.additionalSlidesCount; i++) {
            displayImages.push({
              link: '#',
              title: '',
              image_link: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMDUpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPiR7aSArIDF9PC90ZXh0Pjwvc3ZnPg==`,
              description: `空白項目 ${i + 1}`,
              price: '',
              sale_price: null,
              isBlankSlide: true,
              blankIndex: i // 標記空白項目索引，確保每個都不同
            });
          }
          // console.log(`已添加 ${this.additionalSlidesCount} 個空白項目，總項目數：${displayImages.length}`);
        }
      }
      
      // console.log('displayImages', displayImages);
      const items = displayImages.map(img => {
        // 檢查是否為空白項目或重複項目，決定顯示內容
        const isSpecialSlide = img.isBlankSlide || img.isDuplicateSlide;
        const shouldShowContent = !img.isBlankSlide; // 空白項目不顯示內容，重複項目顯示內容
        
        return `
        <a class="embeddedItem swiper-slide ${isSpecialSlide ? 'special-slide' : ''}" 
           href="${shouldShowContent ? img.link : '#'}" 
           ${shouldShowContent ? 'target="_blank"' : ''} 
           data-title="${img.title}" 
           data-link="${img.link}"
           ${img.isBlankSlide ? 'style="pointer-events: none;"' : ''}>
          <div class="embeddedItem__img" style="position: relative;">
            <div class="embeddedItem__imgBox" style="background-color: #efefef;">
              ${img.size_tag && !hide_size && shouldShowContent ? `<div class="embeddedItem__sizeTag">${img.size_tag}</div>` : ''}
              <img loading="lazy" 
                   src="${img.image_link}" 
                   alt="${img.description}" 
                   style="width: 100%; height: auto; object-fit: cover; ${img.isBlankSlide ? 'opacity: 0.3;' : ''}">
            </div>
          </div>
          ${shouldShowContent ? `
          <div class="embeddedItemInfo">
            <h3 class="embeddedItemInfo__title">${img.title}</h3>
            ${hide_discount?`<div class="embeddedItemInfo__content">
                  <p class="embeddedItemInfo__price">NT$ ${img.price}</p>
                </div>`: displayMode === 'SocialProofNum' && !!img.record_cnt ?
                `<div class="embeddedItemInfo__content">
                  <p class="embeddedItemInfo__discount">${img.record_cnt}人購買</p>
                  <p class="embeddedItemInfo__price">NT$ ${img.price}</p>
                </div>`:
                displayMode === 'SaleRate' && !!img.sale_price && img.sale_price !== img.price
              ? `<div class="embeddedItemInfo__content">
                  <p class="embeddedItemInfo__discount">${Math.ceil(100 - (parseInt(img.sale_price.replace(',', '')) * 100) / parseInt(img.price.replace(',', '')))}% off</p>
                  <p class="embeddedItemInfo__price">NT$ ${img.sale_price}</p>
                </div>`
              : `<div class="embeddedItemInfo__content">
                  <p class="embeddedItemInfo__discount">5% off</p>
                  <p class="embeddedItemInfo__price">NT$ ${img.price}</p>
                </div>`}
          </div>
          ` : '<div class="embeddedItemInfo" style="height: 60px;"></div>'}
        </a>
      `;
      }).join('');
  
             // 修復：當組件被 append 到外部容器時，需要從外部 DOM 查找元素
       // 使用更靈活的選擇器，不依賴特定的 containerId
       const swiperWrapper = this.shadowRoot.querySelector(`#swiper-wrapper-basic-${containerId}`) || 
                            document.querySelector(`#swiper-wrapper-basic-${containerId}`) ||
                            this.shadowRoot.querySelector('[id*="swiper-wrapper-basic-"]') ||
                            document.querySelector('[id*="swiper-wrapper-basic-"]');
       
       if (swiperWrapper) {
         $(swiperWrapper).html(items);
       } else {
         console.error(`找不到 Swiper wrapper 元素，containerId: ${containerId}`);
         return;
       }
  
      // 如果是重置推薦且已存在 Swiper 實例，需要重新初始化以確保事件監聽器正常工作
      if (isResetRecom && existingSwiper) {
        // 隱藏 loading 狀態
        $(this.shadowRoot.querySelector(`#${containerId} #recommendation-loading`)).fadeOut(400, () => {
          // 同時顯示標題區域和輪播容器
          const textSection = this.shadowRoot.querySelector(`#${containerId} .text-section`);
          const embeddedContainer = this.shadowRoot.querySelector(`#${containerId} .infEmbeddedAdContainer`);
          
          if (textSection) {
            $(textSection).show();
          }
          
          if (embeddedContainer) {
            $(embeddedContainer).show();
          }
          
          // 初始化 Swiper
          this.initializeSwiper(containerId, autoplay, adjustedBreakpoints, displayMode);
        });
        
        // 銷毀現有的 Swiper 實例
        existingSwiper.destroy(true, true);
        
        // 重置標記
        window.resetRecomCalled = false;
        
        // 不繼續執行下面的 Swiper 初始化代碼
        return;
      }
  
      // 正常情況下初始化 Swiper
      this.initializeSwiper(containerId, autoplay, adjustedBreakpoints, displayMode);
    }
  
    // 處理項目數量不足的問題 - 動態添加重複項目或空白項目
    adjustSwiperConfigForInsufficientItems(breakpoints, itemCount) {
      const adjustedBreakpoints = JSON.parse(JSON.stringify(breakpoints)); // 深拷貝
      
      // 標記是否需要添加項目
      this.needsMoreSlides = false;
      this.additionalSlidesCount = 0;
      this.slideGenerationStrategy = 'none'; // 'duplicate', 'blank', 'none'
      
      // 遍歷所有斷點配置
      Object.keys(adjustedBreakpoints).forEach(breakpoint => {
        const config = adjustedBreakpoints[breakpoint];
        
        // 檢查 slidesPerView 是否大於項目數量
        if (config.slidesPerView && typeof config.slidesPerView === 'number') {
          const slidesPerView = config.slidesPerView;
          
          // 計算所需的最小項目數量（考慮小數 slidesPerView）
          const requiredSlides = Math.ceil(slidesPerView);
          
          // 為了 loop 正常工作，需要至少是 slidesPerView 的 3-4 倍項目
          // 確保有足夠的項目來處理各種滑動情況
          const idealSlideCount = Math.max(8, Math.ceil(slidesPerView * 3));
          
          if (itemCount < idealSlideCount) {
            // 項目數量不足時的處理策略
            
            const neededSlides = idealSlideCount - itemCount;
            
            // 檢查是否連一輪都不足（項目數量小於 slidesPerView）
            if (itemCount < requiredSlides) {
              // 連一輪都不足，移除 loop 功能
              this.needsMoreSlides = false;
              this.additionalSlidesCount = 0;
              this.slideGenerationStrategy = 'none';
              
              // 移除 loop 功能
              config.loop = false;
              config.loopFillGroupWithBlank = false;
              
              // 調整阻力比例，提供更好的邊界反饋
              config.resistanceRatio = 0.85;
              
            } else if (neededSlides > 0) {
              // 有足夠項目顯示一輪，但不足理想數量，可以使用重複或空白策略
              this.needsMoreSlides = true;
              this.additionalSlidesCount = Math.max(this.additionalSlidesCount, neededSlides);
              
              // 決定生成策略
              if (itemCount >= 2) {
                // 如果有 2 個以上項目，重複現有項目
                this.slideGenerationStrategy = 'duplicate';
              } else {
                // 如果項目太少，添加空白項目
                this.slideGenerationStrategy = 'blank';
              }
              
              // 保持 loop 功能
              config.loop = true;
              config.loopFillGroupWithBlank = true;
              
              // 調整阻力比例
              config.resistanceRatio = 0.5;
            }
            
            // 調整 slidesPerGroup 避免跳躍過多
            if (config.slidesPerGroup && config.slidesPerGroup > itemCount) {
              config.slidesPerGroup = Math.max(1, Math.min(config.slidesPerGroup, Math.floor(itemCount / 2) || 1));
            }
            
            // console.log(`處理項目不足：斷點 ${breakpoint}，原始項目 ${itemCount}，需要添加 ${neededSlides} 個項目，策略：${this.slideGenerationStrategy}`);
            
          } else {
            // 項目數量充足，保持原有配置
            // console.log(`項目數量充足：斷點 ${breakpoint}，項目數量 ${itemCount}，slidesPerView ${slidesPerView}，保持原有配置`);
          }
        }
      });
      
      return adjustedBreakpoints;
    }

         // 將 Swiper 初始化邏輯提取為獨立方法
     initializeSwiper(containerId, autoplay, sortedBreakpoints, displayMode) {
       // 修復：當組件被 append 到外部容器時，需要從外部 DOM 查找元素
       // 使用更靈活的選擇器，不依賴特定的 containerId
       const swiperElement = this.shadowRoot.querySelector(`.swiper-basic-${containerId}`) || 
                            document.querySelector(`.swiper-basic-${containerId}`) ||
                            this.shadowRoot.querySelector('[class*="swiper-basic-"]') ||
                            document.querySelector('[class*="swiper-basic-"]');
       
       if (!swiperElement) {
         console.error(`找不到 Swiper 元素進行初始化，containerId: ${containerId}`);
         return;
       }
      
      // 從斷點配置中獲取循環相關設定（優先使用最小斷點的配置）
      const breakpointKeys = Object.keys(sortedBreakpoints).map(Number).sort((a, b) => a - b);
      const smallestBreakpoint = breakpointKeys[0] || 0;
      const smallestConfig = sortedBreakpoints[smallestBreakpoint] || {};
      
      const shouldEnableLoop = smallestConfig.loop !== false;
      // 動態計算 loopedSlides，確保它與實際項目數量匹配
      const actualSlideCount = this.shadowRoot.querySelectorAll('.swiper-slide').length || 
                              document.querySelectorAll(`#${containerId} .swiper-slide`).length;
      const loopedSlides = smallestConfig.loopedSlides || Math.min(actualSlideCount, Math.max(6, actualSlideCount));
      const loopFillGroupWithBlank = smallestConfig.loopFillGroupWithBlank !== false;
      
      const swiperConfig = {
        direction: 'horizontal',
        loop: shouldEnableLoop,
        pagination: false,
        speed: 750,
        autoplay: !autoplay ? false : {
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          stopOnLastSlide: false,
          waitForTransition: true
        },
        slidesPerView: 1,
        slidesPerGroup: 1,
        loopFillGroupWithBlank: loopFillGroupWithBlank,
        spaceBetween: 8,
        navigation: {
          nextEl: [
            this.shadowRoot.querySelector(`#${containerId} .title-nav-next`) || document.querySelector(`#${containerId} .title-nav-next`),
            this.shadowRoot.querySelector(`#${containerId} .swiper-next`) || document.querySelector(`#${containerId} .swiper-next`),
            this.shadowRoot.querySelector(`#${containerId} .swiper-next-corr`) || document.querySelector(`#${containerId} .swiper-next-corr`)
          ].filter(el => el), // 過濾掉 null 元素
          prevEl: [
            this.shadowRoot.querySelector(`#${containerId} .title-nav-prev`) || document.querySelector(`#${containerId} .title-nav-prev`),
            this.shadowRoot.querySelector(`#${containerId} .swiper-prev`) || document.querySelector(`#${containerId} .swiper-prev`),
            this.shadowRoot.querySelector(`#${containerId} .swiper-prev-corr`) || document.querySelector(`#${containerId} .swiper-prev-corr`)
          ].filter(el => el) // 過濾掉 null 元素
        },
        simulateTouch: true,
        touchRatio: 1,
        resistance: true,
        resistanceRatio: 0.65,
        observer: true,
        observeParents: true,
        breakpoints: sortedBreakpoints
      };
      
      // 如果有 loopedSlides 配置，添加到 swiperConfig 中
      if (loopedSlides && shouldEnableLoop) {
        swiperConfig.loopedSlides = loopedSlides;
        // console.log(`設置 loopedSlides: ${loopedSlides}，實際項目數: ${actualSlideCount}`);
      }
      
      // 檢查 Swiper 是否已載入
      if (typeof window.Swiper === 'undefined') {
        console.error('Swiper 尚未載入，無法初始化輪播');
        return;
      }
      
      const swiper = new window.Swiper(swiperElement, {
        ...swiperConfig,
        on: {
          init: () => {
                         // 修復：當組件被 append 到外部容器時，需要從外部 DOM 查找元素
             // 使用更靈活的選擇器，不依賴特定的 containerId
             const swiperEl = this.shadowRoot.querySelector(`.swiper-basic-${containerId}`) || 
                              document.querySelector(`.swiper-basic-${containerId}`) ||
                              this.shadowRoot.querySelector('[class*="swiper-basic-"]') ||
                              document.querySelector('[class*="swiper-basic-"]');
             
             if (!swiperEl) {
               console.error(`找不到 Swiper 元素進行事件綁定，containerId: ${containerId}`);
               return;
             }
            
            let isDragging = false;
            let moved = false;
            let startX, startY;
  
            if (window.matchMedia('(hover: hover)').matches) {
              swiperEl.addEventListener('mousedown', (e) => {
                isDragging = true;
                moved = false;
                startX = e.pageX;
                startY = e.pageY;
              });
  
              document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const diffX = Math.abs(e.pageX - startX);
                const diffY = Math.abs(e.pageY - startY);
                if (diffX > 5 || diffY > 5) {
                  moved = true;
                }
              });
  
              document.addEventListener('mouseup', () => {
                isDragging = false;
              });
  
              const slides = swiperEl.querySelectorAll('.swiper-slide a');
              slides.forEach(link => {
                link.addEventListener('click', (e) => {
                  if (moved) {
                    e.preventDefault();
                  }
                });
              });
            }
  
                         // 修復：當組件被 append 到外部容器時，需要從外部 DOM 查找元素
             // 使用更靈活的選擇器，不依賴特定的 containerId
             const loadingElement = this.shadowRoot.querySelector(`#${containerId} #recommendation-loading`) || 
                                   document.querySelector(`#${containerId} #recommendation-loading`) ||
                                   this.shadowRoot.querySelector('#recommendation-loading') ||
                                   document.querySelector('#recommendation-loading');
             const embeddedContainer = this.shadowRoot.querySelector(`#${containerId} .infEmbeddedAdContainer`) || 
                                      document.querySelector(`#${containerId} .infEmbeddedAdContainer`) ||
                                      this.shadowRoot.querySelector('.infEmbeddedAdContainer') ||
                                      document.querySelector('.infEmbeddedAdContainer');
             const textSection = this.shadowRoot.querySelector(`#${containerId} .text-section`) || 
                                document.querySelector(`#${containerId} .text-section`) ||
                                this.shadowRoot.querySelector('.text-section') ||
                                document.querySelector('.text-section');
            
            if (loadingElement) {
              $(loadingElement).fadeOut(400, () => {
                if (embeddedContainer) {
                  // 強制設定 display: block 來覆蓋 CSS 規則
                  embeddedContainer.style.setProperty('display', 'block', 'important');
                  loadingElement.style.setProperty('display', 'none', 'important');
                }
                
                // 載入完成後顯示文字區域
                if (textSection) {
                  $(textSection).css('display', 'flex').hide().fadeIn(600);
                }
                
                // 如果是 popup 模式且為 true 模式，在 loading 完成後顯示彈窗（只在初始載入時）
                if (window.showPopup && typeof window.showPopup === 'function' && window.popupautoShow === true && !window.isPopupVisible && !window.resetRecomCalled) {
                  window.showPopup();
                }
              });
            }
          },
          resize: function() {
            setTimeout(() => {
              this.update();
            }, 500);
          }
        }
      });
    }
  }
  
  customElements.define('inf-product-carousel-component', InfProductCarouselComponent);
  } // 結束 if 檢查
  
  // 提供一個簡化的初始化函數
  window.initInfProductCarouselComponent = function(config = {}) {
    // 創建組件實例
    const carousel = document.createElement('inf-product-carousel-component');
    
    // 設置配置
    carousel.setAttribute('config', JSON.stringify(config));
    
    // 添加到 body，組件會自動處理後續邏輯
    document.body.appendChild(carousel);
    
      // 添加調試方法到全域
    window.debugCarousel = function() {
      if (carousel.shadowRoot) {
        const containers = carousel.shadowRoot.querySelectorAll('[id*="infFits"]');
        
        containers.forEach(container => {
          const containerId = container.id;
          const loading = container.querySelector('#recommendation-loading');
          const embeddedContainer = container.querySelector('.infEmbeddedAdContainer');
          const textSection = container.querySelector('.text-section');
          
          if (embeddedContainer) {
            // 提供手動修復方法
            embeddedContainer.style.setProperty('display', 'block', 'important');
          }
        });
      }
    };
    
    return carousel;
  };

  // 提供手動清理過期快取的全域函數（僅處理推薦商品快取）
  window.cleanupInfCarouselCache = function() {
    try {
      const keys = Object.keys(localStorage);
      const carouselPrefix = 'inf_carousel_cache_';
      const oldConfigPrefix = 'inf_brand_config_cache_'; // 舊的品牌配置快取
      const cacheExpiry = 10 * 60 * 1000; // 10 分鐘
      const maxCacheItems = 5; // 快取數量上限
      const now = Date.now();
      let cleanedCount = 0;
      let carouselCount = 0;
      let oldConfigCount = 0;

      keys.forEach(key => {
        if (key.startsWith(oldConfigPrefix)) {
          // 清理舊的品牌配置快取
          oldConfigCount++;
          localStorage.removeItem(key);
          cleanedCount++;
          // console.log(`🗑️ 已清理舊的品牌配置快取: ${key}`);
        } else if (key.startsWith(carouselPrefix)) {
          carouselCount++;
          try {
            const cached = JSON.parse(localStorage.getItem(key));
            if (cached && cached.timestamp) {
              if (now - cached.timestamp > cacheExpiry) {
                localStorage.removeItem(key);
                cleanedCount++;
                // console.log(`🗑️ 已清理過期的推薦商品快取: ${key}`);
              }
            } else {
              localStorage.removeItem(key);
              cleanedCount++;
              // console.log(`🗑️ 已清理格式錯誤的推薦商品快取: ${key}`);
            }
          } catch (e) {
            localStorage.removeItem(key);
            cleanedCount++;
            // console.log(`🗑️ 已清理無效的推薦商品快取: ${key}`);
          }
        }
      });

      const totalCount = carouselCount + oldConfigCount;
      
      // console.log(`\n📊 快取統計：`);
      // console.log(`   推薦商品快取: ${carouselCount} 個 (上限 ${maxCacheItems} 個)`);
      // console.log(`   舊品牌配置快取: ${oldConfigCount} 個 (已全部清理)`);
      // console.log(`   新品牌配置快取: 0 個 (已移除快取，每次獲取最新配置)`);
      // console.log(`✅ 清理完成：總共 ${totalCount} 個快取項目，已清理 ${cleanedCount} 個過期/無效項目，保留 ${totalCount - cleanedCount} 個有效項目`);
      // console.log(`💡 提示：推薦商品快取最多保存 ${maxCacheItems} 筆，超過會自動刪除最舊的`);
      
      return { 
        total: totalCount, 
        cleaned: cleanedCount, 
        remaining: totalCount - cleanedCount,
        config: 0, // 品牌配置不再快取
        carousel: carouselCount,
        maxPerType: maxCacheItems
      };
    } catch (error) {
      console.error('❌ 清理過期快取時發生錯誤:', error);
      return null;
    }
  };