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
