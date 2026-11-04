import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertMountConfig,
  expandMountConfigs,
  buildItemEventName,
  resolveRecommendApiUrl,
  safeJsonParse,
  debounce,
  convertBrandConfig,
  isValidRecommendationData,
  buildWidgetCacheKey,
  buildProductClickGaPayload,
  buildNavClickGaPayload,
  resolveNavDisplayMode,
  buildMktClickPayload,
  resolveProductImageUrl,
  PRODUCT_IMAGE_PLACEHOLDER,
  buildCompactSlide,
  renderCompactSlideHtml,
  resolveCompactBottomOffset
} from '../inf-product-carousel-widget.js';

test('assertMountConfig throws without carousel(s)', () => {
  assert.throws(() => assertMountConfig({ brand: 'DES' }), /carousel/);
});

test('assertMountConfig throws on empty carousels', () => {
  assert.throws(() => assertMountConfig({ brand: 'DES', carousels: [] }), /carousels/);
});

test('assertMountConfig throws on non-object config', () => {
  assert.throws(() => assertMountConfig(null), /物件/);
});

test('assertMountConfig throws when carousel is not object', () => {
  assert.throws(() => assertMountConfig({ brand: 'DES', carousel: 'x' }), /carousel/);
});

test('assertMountConfig accepts valid carousel', () => {
  assert.doesNotThrow(() => assertMountConfig({ brand: 'DES', carousel: { type: 'product' } }));
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

test('expandMountConfigs maps null carousel entry to empty object', () => {
  const list = expandMountConfigs({
    brand: 'DES',
    carousels: [null]
  });
  assert.deepEqual(list[0].carousel, {});
});

test('buildItemEventName matrix', () => {
  assert.equal(buildItemEventName(''), 'click_embedded_itemA');
  assert.equal(buildItemEventName('bhv'), 'bhv_click_embedded_itemA');
  assert.equal(buildItemEventName('corr'), 'corr_click_embedded_itemA');
  assert.equal(buildItemEventName('sp_atc'), 'sp_atc_click_embedded_itemA');
  assert.equal(buildItemEventName('sp_trans'), 'sp_trans_click_embedded_itemA');
  assert.equal(buildItemEventName('bhv', 'B'), 'bhv_click_embedded_itemB');
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
    resolveRecommendApiUrl({ brand: 'DES', carouselType: 'product', series_in: '["女"]' }),
    /HTTP_stock_cdp_product_recommendation/
  );
  assert.match(
    resolveRecommendApiUrl({ brand: 'DES', carouselType: 'product' }),
    /HTTP_inf_alpha_bhv_cdp_product_recommendation/
  );
});

test('safeJsonParse', () => {
  assert.deepEqual(safeJsonParse('{"a":1}'), { a: 1 });
  assert.equal(safeJsonParse('{bad', null), null);
  assert.equal(safeJsonParse('', 42), 42);
  assert.equal(safeJsonParse(null, 'x'), 'x');
});

test('debounce fires once after wait and cancel prevents fire', async () => {
  let count = 0;
  const d = debounce(() => { count += 1; }, 30);
  d();
  d();
  d();
  assert.equal(count, 0);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(count, 1);

  d();
  d.cancel();
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(count, 1);
});

test('convertBrandConfig maps fields and tolerates missing carousel', () => {
  const out = convertBrandConfig({
    Title: '推薦',
    Description: 'desc',
    DisplayMode: 'SaleRate',
    RecommendMode: 'bhv',
    CarouselButton: false,
    CarouselLayout: 3,
    Location: 'top',
    status: true
  }, {
    showPositionId: { top: 'H', bottom: 'F' },
    carousel: { type: 'product', hide_size: true }
  });
  assert.equal(out.title, '推薦');
  assert.equal(out.description, 'desc');
  assert.equal(out.displayMode, 'SaleRate');
  assert.equal(out.recommendMode, 'bhv');
  assert.equal(out.arrowPosition, 'none');
  assert.equal(out.hide_size, true);
  assert.equal(out.containerId, 'H');
  assert.equal(out.enabled, true);
  assert.equal(out.breakpoints[768].slidesPerView, 3);

  assert.deepEqual(convertBrandConfig(null), {});
  assert.doesNotThrow(() => convertBrandConfig({ Title: 'T' }, {}));
});

test('convertBrandConfig reads showPositionId from nested carousel (mount API)', () => {
  const out = convertBrandConfig({
    Location: 'bottom',
    status: true,
    Title: '您可能會喜歡'
  }, {
    brand: 'DES',
    GA4Key: '',
    carousel: {
      type: 'popup',
      showPositionId: { bottom: 'popupProductContent' }
    }
  });
  assert.equal(out.containerId, 'popupProductContent');
  assert.equal(out.showPositionId.bottom, 'popupProductContent');
  assert.equal(out.title, '您可能會喜歡');
});

test('isValidRecommendationData', () => {
  assert.equal(isValidRecommendationData(null), false);
  assert.equal(isValidRecommendationData({}), false);
  assert.equal(isValidRecommendationData({ bhv: [] }), false);
  assert.equal(isValidRecommendationData({ bhv: [{ id: 1 }] }), true);
  assert.equal(isValidRecommendationData({ corr: [{ id: 1 }] }), true);
  assert.equal(isValidRecommendationData({
    bhv: [{ id: 1 }],
    SIZEAI_result: { error: true }
  }), false);
  assert.equal(isValidRecommendationData({
    bhv: [{ id: 1 }],
    SIZEAI_result: { error_type: 'x' }
  }), false);
});

test('buildWidgetCacheKey', () => {
  assert.equal(
    buildWidgetCacheKey('product', '/Products/ABC'),
    'inf_widget_carousel_cache_product__products_abc'
  );
  assert.equal(
    buildWidgetCacheKey('popup', '/'),
    'inf_widget_carousel_cache_popup__'
  );
});

test('buildProductClickGaPayload', () => {
  const ga = buildProductClickGaPayload('鞋', 'https://x.com/a', 'bhv');
  assert.equal(ga.eventName, 'bhv_click_embedded_itemA');
  assert.equal(ga.eventData.event_category, 'infEmbeddedAdContainer-embedded');
  assert.equal(ga.eventData.event_label, 'Title: 鞋');
  assert.equal(ga.eventData.value, 'https://x.com/a'.length);

  const empty = buildProductClickGaPayload('', null, '');
  assert.equal(empty.eventName, 'click_embedded_itemA');
  assert.equal(empty.eventData.value, 0);
});

test('buildNavClickGaPayload', () => {
  assert.equal(buildNavClickGaPayload('left').eventName, 'click_embedded_item_arrow_leftA');
  assert.equal(buildNavClickGaPayload('right').eventData.event_label, 'arrow-right');
  assert.equal(buildNavClickGaPayload('prev').eventName, 'click_embedded_item_title_nav_prevA');
  assert.equal(buildNavClickGaPayload('next').eventData.value, 10);
  assert.throws(() => buildNavClickGaPayload('nope'), /未知 kind/);
});

test('resolveNavDisplayMode', () => {
  assert.deepEqual(resolveNavDisplayMode('none', 1200), {
    showSideArrows: false,
    showTitleNav: false,
    showCorrPrev: true
  });
  assert.deepEqual(resolveNavDisplayMode('center', 1200), {
    showSideArrows: true,
    showTitleNav: false,
    showCorrPrev: true
  });
  assert.deepEqual(resolveNavDisplayMode('center', 375), {
    showSideArrows: false,
    showTitleNav: true,
    showCorrPrev: false
  });
});

test('buildMktClickPayload', () => {
  const p = buildMktClickPayload({
    brand: 'DES',
    bid: { GVID: 'g1' },
    ids: { lgiven_id: 'L', member_id: 'M' },
    eventRecom: 'corr',
    carouselType: 'popup',
    link: 'https://a',
    title: 'T',
    pid: 'P1'
  });
  assert.equal(p.Brand, 'DES');
  assert.equal(p.GVID, 'g1');
  assert.equal(p.LGVID, 'L');
  assert.equal(p.MRID, 'M');
  assert.equal(p.recom_type, 'corr');
  assert.equal(p.recom_loc, 'popup');
  assert.equal(p.action, 'click');
  assert.equal(p.action_pid, 'P1');

  const embed = buildMktClickPayload({ brand: 'X', carouselType: 'product' });
  assert.equal(embed.recom_loc, 'embed');
  assert.equal(embed.GVID, '');
});

test('resolveProductImageUrl falls back for missing/undefined values', () => {
  assert.equal(resolveProductImageUrl(undefined), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(resolveProductImageUrl(null), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(resolveProductImageUrl({}), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(resolveProductImageUrl({ image_link: undefined }), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(resolveProductImageUrl({ image_link: 'undefined' }), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(resolveProductImageUrl({ image_link: 'null' }), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(resolveProductImageUrl({ image_link: '  ' }), PRODUCT_IMAGE_PLACEHOLDER);
});

test('resolveProductImageUrl prefers usable fields', () => {
  assert.equal(
    resolveProductImageUrl({ image_link: 'https://cdn.example/a.jpg' }),
    'https://cdn.example/a.jpg'
  );
  assert.equal(
    resolveProductImageUrl({ imageUrl: 'https://cdn.example/b.jpg' }),
    'https://cdn.example/b.jpg'
  );
  assert.equal(
    resolveProductImageUrl({ image_link: undefined, image: 'https://cdn.example/c.jpg' }),
    'https://cdn.example/c.jpg'
  );
  assert.equal(
    resolveProductImageUrl('https://cdn.example/direct.jpg'),
    'https://cdn.example/direct.jpg'
  );
});

const compactItem = (id, extra = {}) => ({
  id,
  title: `商品 ${id}`,
  link: `https://shop.example/${id}`,
  image_link: `https://img.example/${id}.jpg`,
  price: '880 TWD',
  sale_price: '599 TWD',
  availability: 'in stock',
  ...extra
});

test('compact slide shows the count in SocialProofNum mode with one copy for every source', () => {
  for (const event_recom of ['sp_atc', 'sp_trans']) {
    const slide = buildCompactSlide(compactItem('a', { record_cnt: 1, event_recom }), {
      displayMode: 'SocialProofNum'
    });
    assert.deepEqual(slide.proof, { kind: 'count', count: 1 });
    assert.equal(slide.eventRecom, event_recom);
    assert.ok(renderCompactSlideHtml(slide).includes('位顧客購買這款商品'));
  }
});

test('compact slide shows the price without a count or outside SocialProofNum', () => {
  const saleProof = { kind: 'price', price: 599, originalPrice: 880 };
  assert.deepEqual(
    buildCompactSlide(compactItem('a'), { displayMode: 'SocialProofNum' }).proof,
    saleProof
  );
  assert.deepEqual(
    buildCompactSlide(compactItem('a', { record_cnt: 50 }), { displayMode: 'SaleRate' }).proof,
    saleProof
  );
});

test('compact slide shows only the original price when hide_discount is set', () => {
  const slide = buildCompactSlide(compactItem('a', { record_cnt: 50 }), {
    displayMode: 'SocialProofNum',
    hide_discount: true
  });
  assert.deepEqual(slide.proof, { kind: 'price', price: 880, originalPrice: null });
});

test('compact slide shows the size tag only when hide_size is off', () => {
  const item = compactItem('a', { size_tag: 'UK7<' });
  const shown = renderCompactSlideHtml(buildCompactSlide(item, { hide_size: false }));
  assert.ok(shown.includes('<span class="inf-compact__size">UK7&lt;</span>'));
  const hidden = renderCompactSlideHtml(buildCompactSlide(item, { hide_size: true }));
  assert.ok(!hidden.includes('inf-compact__size'));
  const noSize = renderCompactSlideHtml(buildCompactSlide(compactItem('b'), { hide_size: false }));
  assert.ok(!noSize.includes('inf-compact__size'));
});

test('compact slide HTML escapes API text', () => {
  const slide = buildCompactSlide(compactItem('x', { title: '<img src=x onerror=alert(1)>"' }), {
    displayMode: 'SaleRate'
  });
  const html = renderCompactSlideHtml(slide);
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;&quot;'));
});

test('compact clears a bottom bar pinned to the viewport', () => {
  assert.equal(resolveCompactBottomOffset({ top: 776, bottom: 844, height: 68 }, 844), 80);
});

test('compact ignores a missing, hidden, or unpinned bottom bar', () => {
  assert.equal(resolveCompactBottomOffset(undefined, 844), null);
  assert.equal(resolveCompactBottomOffset({ top: 0, bottom: 0, height: 0 }, 844), null);
  assert.equal(resolveCompactBottomOffset({ top: 400, bottom: 468, height: 68 }, 844), null);
  assert.equal(resolveCompactBottomOffset({ top: 900, bottom: 968, height: 68 }, 844), null);
});

test('compact uses the stock endpoint and its own click location', () => {
  assert.match(
    resolveRecommendApiUrl({ brand: 'DES', carouselType: 'compact' }),
    /HTTP_stock_cdp_product_recommendation/
  );
  assert.equal(buildMktClickPayload({ carouselType: 'compact' }).recom_loc, 'compact');
});
