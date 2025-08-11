class InfProductCarouselComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['config'];
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
      const { brand = 'JERSCY' } = config;
      
      try {
        // 調用品牌配置 API
        const brandConfigResponse = await fetch('https://api.inffits.com/mkt_brand_config_proc/GetItems', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ Brand: brand })
        });

        if (!brandConfigResponse.ok) {
          throw new Error(`品牌配置 API 調用失敗: ${brandConfigResponse.status}`);
        }

        const brandConfigResponseData = await brandConfigResponse.json();
        const brandConfig = brandConfigResponseData.find(
            item => item.Module === 'Product_Carousel_Widget'
          )?.ConfigData.Section_Info[0];
        console.log('品牌配置資料:', brandConfig);

        // 將 brandConfig 轉換為標準配置格式
        const convertedBrandConfig = this.convertBrandConfig(brandConfig, config);
        console.log('轉換後的品牌配置:', convertedBrandConfig);

        // 將轉換後的品牌配置合併到原有配置中
        const mergedConfig = {
          ...config,
          ...convertedBrandConfig,
          brandConfig: brandConfig // 保留原始 brandConfig 供其他地方使用
        };

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

      // RecommendMode: 直接使用
      if (brandConfig.RecommendMode) {
        convertedConfig.recommendMode = brandConfig.RecommendMode;
      }

        // Title: 變更 title
      if (brandConfig.Title) {
        convertedConfig.title = brandConfig.Title;
      }

      // CarouselLayout: 變更 breakpoints 768 的 slidesPerView, slidesPerGroup
      if (brandConfig.CarouselLayout && typeof brandConfig.CarouselLayout === 'number') {
        convertedConfig.breakpoints = {
          1024: {
            slidesPerView: brandConfig.CarouselLayout,
            slidesPerGroup: brandConfig.CarouselLayout,
            spaceBetween: 24,
            loopFillGroupWithBlank: true
          },
          768: {
            slidesPerView: brandConfig.CarouselLayout > 5 ? 4 : brandConfig.CarouselLayout,
            slidesPerGroup: brandConfig.CarouselLayout > 5 ? 4 : brandConfig.CarouselLayout,
            spaceBetween: 24,
            loopFillGroupWithBlank: true
          }
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
        console.log('組件已停用，不進行初始化');
        return;
      }
      
      const defaultConfig = {
        brand: 'JERSCY',
        containerId: 'infFitsFooter',
        customEdm: [],
        backgroundColor: '#fff',
        title: '推薦您也可以這樣搭配',
        description: '',
        displayMode: 'SaleRate',
        recommendMode: 'bhv,corr,sp_atc_sp_trans',
        customPadding: null,
        arrowPosition: 'center',
        autoplay: true,
        hide_discount: false,
        hide_size: false,
        ctype_val: ['underwear'],
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
        ctype_val,
        bid,
        backgroundColor,
        title,
        description,
        displayMode,
        recommendMode,
        autoplay,
        arrowPosition,
        customPadding
      } = finalConfig;
  
      const sortedBreakpoints = Object.keys(finalConfig.breakpoints)
        .map(Number)
        .sort((a, b) => b - a)
        .reduce((acc, key) => {
          acc[key] = finalConfig.breakpoints[key];
          return acc;
        }, {});
  
            const Brand = brand;
      const skuContent = this.shopline_sku();
      const show_up_position_before = `#${containerId}`;
      const test = 'A';
      let GA4Key = '';

      // 輸出最終配置以供調試
      console.log('最終配置:', finalConfig);
      console.log('原始品牌配置:', config.brandConfig);

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
        show_up_position_before,
        test,
        GA4Key
      }));
    }
  
    render(containerId, backgroundColor, title) {
      // 先清空 shadow DOM，準備根據配置重新渲染
      this.shadowRoot.innerHTML = `
        <div id="temp-container" style="display: none;">
          <div id="recommendation-loading">
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
          <div id="${containerId}" style="background-color: ${backgroundColor}; border-radius: 8px;max-width: 1280px;margin: 0 auto;">
            <div id="recommendation-loading">
              <span class="loading-text">Loading...</span>
            </div>
          </div>
        `;
        
        // 更新 shadow DOM 內容
        this.shadowRoot.innerHTML = componentContent;
        
        // 將整個組件 append 到目標容器
        targetContainer.appendChild(this);
        
        console.log(`組件已自動 append 到容器: ${containerId}`);
        return true;
      } else {
        console.warn(`目標容器 ${containerId} 不存在，組件將保持在當前位置`);
        return false;
      }
    }
  
    member_id_91APP() {
      let member_id = '';
      if (typeof dataLayer !== 'undefined') {
        for (let i = 0; i < dataLayer.length; i++) {
          if (dataLayer[i].Action === 'Product-Detail') {
            console.log('找到了符合 "gtm.load" 的事件，執行後續動作');
            console.log('FOUND!!');
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
            console.log('找到了符合 "gtm.load" 的事件，執行後續動作');
            console.log('FOUND!!');
            member_id = dataLayer[i].Uid !== '' ? dataLayer[i].Uid : '';
            break;
          } else {
            member_id = '';
          }
        }
      }
      return member_id;
    }
  
    plain_me_sku() {
      let skuContent;
      const metaTag = document.querySelector('meta[property="og:sku"]');
      if (metaTag) {
        skuContent = metaTag.getAttribute('content').split('-')[0];
        console.log(skuContent);
      } else if (document.querySelector('.prodnoBox') !== null) {
        skuContent = document.querySelector('.prodnoBox').innerText.split(':')[1].split('-')[0];
      } else {
        console.log('Meta tag not found');
      }
      return skuContent;
    }
  
    app91_sku() {
      return document.location.href.split('?')[0].split('/SalePage/Index/')[1];
    }
  
    shopline_sku() {
      return '627b5ab044a027000fde0add';
    }
  
    ensureEmbeddedAdJQueryLoaded(callback) {
      if (typeof jQuery === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
        script.type = 'text/javascript';
        script.onload = () => {
          this.loadSwiperScript();
          callback();
        };
        script.onerror = () => console.error('載入 jQuery 時出錯');
        document.head.appendChild(script);
      } else {
        this.loadSwiperScript();
        callback();
      }
    }
  
    loadSwiperScript() {
      const swiperStylesheet = document.createElement('link');
      swiperStylesheet.rel = 'stylesheet';
      swiperStylesheet.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
      this.shadowRoot.appendChild(swiperStylesheet);
  
      const swiperScript = document.createElement('script');
      swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
      swiperScript.onload = () => {};
      swiperScript.onerror = () => console.error('Error loading Swiper script');
      document.head.appendChild(swiperScript);
    }
  
    loadEmbeddedScript(containerId, config) {
      const {
        brand,
        customEdm,
        hide_discount,
        hide_size,
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
        show_up_position_before,
        test,
        GA4Key
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
          --swiper-wrapper-transition-timing-function: linear !important;
        }
        #${containerId} #recommendation-loading {
          height: 131.71px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        @media (min-width: 480px) {
          #${containerId} #recommendation-loading {
            height: 169.14px;
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
        #${containerId} .embeddedAdContainer {
          padding: 0px;
          margin: 0 auto;
          width: 100%;
          min-width: 100%;
          max-width: 100%;
          display: none;
          position: relative;
          width: fit-content;
        }
        #${containerId} .embeddedAdContainer * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          #${containerId} .embeddedAdContainer {
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
        #${containerId} .embeddedAdContainer a {
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
        #${containerId} .embeddedAdContainer a:hover,
        #${containerId} .embeddedAdContainer a:visited,
        #${containerId} .embeddedAdContainer a:link,
        #${containerId} .embeddedAdContainer a:active {
          text-decoration: none;
        }
        #${containerId} .embeddedAdContainer a:focus {
          outline: none;
        }
        #${containerId} .embeddedAdContainer .embeddedAdContainer__title {
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          text-align: center;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          color: #000;
          font-size: var(--inf-embedded-ad-font-16);
          letter-spacing: 1.6px;
          text-align: left;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 768px) {
          #${containerId} .embeddedAdContainer .embeddedAdContainer__title {
            margin-top: 0px;
          }
        }
        @media (min-width: 1025px) {
          #${containerId} .embeddedAdContainer .embeddedAdContainer__title {
            color: var(--inf-embedded-ad-dark-yellow), var(--inf-embedded-ad-dark-gray);
            font-size: 22px;
            letter-spacing: 0.84px;
            font-weight: 500;
            margin-top: 0px;
          }
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          width: 100%;
          justify-content: center;
          align-items: center;
          row-gap: 12px;
          padding: 0;
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img {
          position: relative;
          width: 100%;
          border-radius: 8px; /* 直接使用值，確保圓角生效 */
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__img--tag {
          position: absolute;
          top: 4px;
          left: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }
        @media (min-width: 768px) {
          #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__img--tag {
            top: 8px;
            left: 8px;
          }
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__img--tag div {
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
          #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__img--tag div {
            padding: 5px 8px;
            font-size: var(--inf-embedded-ad-font-14);
            line-height: 17px;
          }
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__imgBox {
          width: 100%;
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          display: grid;
          place-items: center;
          border-radius: 8px; /* 直接使用值，確保圓角生效 */
          will-change: transform;
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__sizeTag {
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
          #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img .embeddedItem__sizeTag {
            bottom: 12px;
            right: 12px;
            padding: 14px 20px;
            font-size: 17px;
            line-height: 22px;
            letter-spacing: -0.136px;
          }
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItem__img img {
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
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        @media (min-width: 768px) {
          #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo {
            gap: 2px;
          }
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__title {
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

      #${containerId} .text-section h2 {
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
        #${containerId} .embeddedAdContainer__wrapper{
          gap: 64px;
        }
        #${containerId} .text-section {
          gap: 24px;
        }

       #${containerId} .text-section h2 {
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
          #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__title {
            font-size: var(--inf-embedded-ad-font-custom);
            line-height: 23px;
            letter-spacing: 0.36px;
          }
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__price--original {
          color: var(--inf-embedded-ad-dark-red);
          text-align: center;
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: 17px;
        }
        @media (min-width: 768px) {
          #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__price--original {
            font-size: var(--inf-embedded-ad-font-custom);
            line-height: 23px;
          }
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 2px;
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__discount {
          color: #eb7454;
          background: white;
          border: 1px solid #eb7454;
          padding: 0 4px;
          border-radius: 5px;
          font-size: 12px;
          opacity: 1;
          transform: scale(0.8);
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__sptext {
          color: #333;
          background: white;
          padding: 0 4px;
          border-radius: 5px;
          font-size: 12px;
          opacity: 1;
          text-align: center;
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price {
          margin-right: 8px;
          color: var(--inf-embedded-ad-dark-red);
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          font-size: var(--inf-embedded-ad-font-12);
          font-style: normal;
          font-weight: 500;
          line-height: 17px;
        }
        @media (min-width: 768px) {
          #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price {
            font-size: var(--inf-embedded-ad-font-custom);
            line-height: 23px;
          }
        }
        #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price--original {
          color: var(--inf-embedded-ad-light-gray);
          font-family: "Noto Sans TC", "Figtree", sans-serif;
          font-size: var(--inf-embedded-ad-font-9);
          font-weight: 500;
          line-height: 14px;
        }
        @media (min-width: 768px) {
          #${containerId} .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price--original {
            font-size: var(--inf-embedded-ad-font-12);
            line-height: 17px;
          }
        }
        #${containerId} .embeddedAdContainer .swiper-slide {
          -webkit-backface-visibility: hidden;
          -webkit-transform: translate3d(0,0,0);
        }
        #${containerId} .embeddedAdContainer .swiper-wrapper {
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
        #${containerId}.small-container .embeddedAdContainer .embeddedAdContainer__title {
          font-size: 16px;
        }
        #${containerId}.small-container .embeddedAdContainer .embeddedAdImgContainer .embeddedItem {
          row-gap: 8px;
        }
        #${containerId}.small-container .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__title,
        #${containerId}.small-container .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__price--original,
        #${containerId}.small-container .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price,
        #${containerId}.small-container .embeddedAdContainer .embeddedAdImgContainer .embeddedItem .embeddedItemInfo .embeddedItemInfo__content .embeddedItemInfo__price--original {
          font-size: 12px;
          line-height: 16px;
        }
      `;
      shadowRoot.appendChild(customCSS);
  
      $(() => {
        let ids = this.ids_init();
  
        const embeddedContainer = `
                 <div class="embeddedAdContainer__wrapper">
             <div class="text-section">
               <h2 class="embeddedAdContainer__title">${title}</h2>
               ${description ? `<p class="embeddedAdContainer__desc">${description}</p>` : ''}
             </div>
          <div class="embeddedAdContainer" id="embedded-ad-container-${containerId}">
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
  
        this.getEmbeddedAds(ids, containerId, {
          brand,
          customEdm,
          hide_discount,
          hide_size,
          ctype_val,
          bid,
          autoplay,
          sortedBreakpoints
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
  
        $(shadowRoot).on('click', `#${containerId} .title-nav-prev`, function() {
          $(shadowRoot.querySelector(`#${containerId} .swiper-prev`)).trigger('click');
        });
  
        $(shadowRoot).on('click', `#${containerId} .title-nav-next`, function() {
          $(shadowRoot.querySelector(`#${containerId} .swiper-next`)).trigger('click');
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
  
    ids_init() {
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
  
      return {
        member_id,
        lgiven_id,
        skuContent: this.shopline_sku()
      };
    }
  
    getEmbeddedAds(ids, containerId, config) {
      const { brand, customEdm, hide_discount, hide_size, ctype_val, bid, autoplay, sortedBreakpoints, displayMode } = config;
  
      const requestData = brand.toLocaleUpperCase() === 'DABE' ? {
        Brand: brand,
        LGVID: ids.lgiven_id,
        MRID: ids.member_id,
        recom_num: "12",
        series_out: "[\"成長型\"]",
        PID: ids.skuContent,
        SP_PID: "xxSOCIAL PROOF",
        SIZEAI_ptr: "bhv"
      } : {
        Brand: brand,
        LGVID: ids.lgiven_id,
        MRID: ids.member_id,
        recom_num: '12',
        PID: ids.skuContent,
        SP_PID: "xxSOCIAL PROOF",
        SIZEAI_ptr: "bhv"
      };
  
      if (ctype_val && ctype_val.length > 0) {
        requestData.ctype_val = JSON.stringify(ctype_val);
      }
  
      if (!hide_size) {
        requestData.SIZEAI = 'True';
        requestData.bid = bid;
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
  
      const api_recom_product_url = brand.toLocaleUpperCase() === 'DABE' ? 'HTTP_stock_cdp_product_recommendation' : 'HTTP_inf_alpha_bhv_cdp_product_recommendation';
  
      fetch(`https://api.inffits.com/${api_recom_product_url}/extension/recom_product`, options)
        .then(response => response.json())
        .then(response => {
          let size_tag = {};
  
          if (response['SIZEAI_result']) {
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
          }
  
          let jsonData = customEdm && customEdm.length > 0
            ? customEdm.map(item => {
                let newItem = Object.assign({}, item);
                newItem.sale_price = hide_discount ? null : item.sale_price ? parseInt(item.sale_price.replace(/\D/g, '')).toLocaleString() : '';
                newItem.price = parseInt(item.price.replace(/\D/g, '')).toLocaleString();
                return newItem;
              })
            : getRandomElements(response['bhv'], response['bhv'].length > 12 ? 12 : response['bhv'].length).map(item => {
                let newItem = Object.assign({}, item);
                newItem.sale_price = hide_discount ? null : item.sale_price ? parseInt(item.sale_price.replace(/\D/g, '')).toLocaleString() : '';
                newItem.price = parseInt(item.price.replace(/\D/g, '')).toLocaleString();
                return newItem;
              });
  
          if (jsonData.length > 0) {
            this.updatePopAd(jsonData, containerId, autoplay, sortedBreakpoints, displayMode);
          } else {
            $(this.shadowRoot.querySelector(`#${containerId} #recommendation-loading`)).fadeOut(400);
            if (containerId === 'personalized-recommendations') {
              $('#jump-recom').hide();
            }
            if (containerId === 'more-recommendations') {
              $('#jump-more').hide();
            }
          }
        })
        .catch(err => console.error(err));
    }
  
    updatePopAd(images, containerId, autoplay, sortedBreakpoints, displayMode) {
      let displayImages = images;
  
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
  
      const items = displayImages.map(img => `
        <a class="embeddedItem swiper-slide" href="${img.link}" target="_blank" data-title="${img.title}" data-link="${img.link}">
          <div class="embeddedItem__img" style="position: relative;">
            <div class="embeddedItem__imgBox" style="background-color: #efefef;">
              ${img.size_tag ? `<div class="embeddedItem__sizeTag">${img.size_tag}</div>` : ''}
              <img loading="lazy" src="${img.image_link}" alt="${img.description}" style="width: 100%; height: auto; object-fit: cover;">
            </div>
          </div>
          <div class="embeddedItemInfo">
            <h3 class="embeddedItemInfo__title">${img.title}</h3>
            
            ${displayMode === 'SocialProofNum' && img.record_cnt?
                `<div class="embeddedItemInfo__content">
                  <p class="embeddedItemInfo__discount">${img.record_cnt}人購買</p>
                  <p class="embeddedItemInfo__price">NT$ ${img.price}</p>
                </div>`:
                img.sale_price && img.sale_price !== img.price
              ? `<div class="embeddedItemInfo__content">
                  <p class="embeddedItemInfo__discount">${Math.ceil(100 - (parseInt(img.sale_price.replace(',', '')) * 100) / parseInt(img.price.replace(',', '')))}% off</p>
                  <p class="embeddedItemInfo__price">NT$ ${img.sale_price}</p>
                </div>`
              : `<div class="embeddedItemInfo__content">
                  <p class="embeddedItemInfo__discount">5% off</p>
                  <p class="embeddedItemInfo__price">NT$ ${img.price}</p>
                </div>`}
          </div>
        </a>
      `).join('');
  
      $(this.shadowRoot.querySelector(`#swiper-wrapper-basic-${containerId}`)).html(items);
  
      const swiper = new Swiper(this.shadowRoot.querySelector(`.swiper-basic-${containerId}`), {
        direction: 'horizontal',
        loop: true,
        pagination: false,
        autoplay: !autoplay ? false : {
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          stopOnLastSlide: false,
          waitForTransition: true
        },
        slidesPerView: 1,
        slidesPerGroup: 1,
        loopFillGroupWithBlank: true,
        spaceBetween: 8,
        navigation: {
          nextEl: this.shadowRoot.querySelector(`#${containerId} .swiper-next`),
          prevEl: this.shadowRoot.querySelector(`#${containerId} .swiper-prev`)
        },
        simulateTouch: true,
        touchRatio: 1,
        resistance: true,
        resistanceRatio: 0.65,
        observer: true,
        observeParents: true,
                on: {
          init: () => {
            const swiperEl = this.shadowRoot.querySelector(`.swiper-basic-${containerId}`);
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

            $(this.shadowRoot.querySelector(`#${containerId} #recommendation-loading`)).fadeOut(400, () => {
              $(this.shadowRoot.querySelector(`#${containerId} .embeddedAdContainer`)).show();
              // 載入完成後顯示文字區域
              $(this.shadowRoot.querySelector(`#${containerId} .text-section`)).css('display', 'flex').hide().fadeIn(600);
            });
          },
          resize: function() {
            setTimeout(() => {
              this.update();
            }, 500);
          }
        },
        breakpoints: sortedBreakpoints
      });
    }
  }
  
  customElements.define('inf-product-carousel-component', InfProductCarouselComponent);

  // 提供一個簡化的初始化函數
  window.initInfProductCarouselComponent = function(config = {}) {
    // 創建組件實例
    const carousel = document.createElement('inf-product-carousel-component');
    
    // 設置配置
    carousel.setAttribute('config', JSON.stringify(config));
    
    // 添加到 body，組件會自動處理後續邏輯
    document.body.appendChild(carousel);
    
    return carousel;
  };