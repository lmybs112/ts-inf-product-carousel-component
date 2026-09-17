import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertMountConfig,
  expandMountConfigs,
  buildItemEventName,
  resolveRecommendApiUrl,
  safeJsonParse,
  debounce
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

test('safeJsonParse', () => {
  assert.deepEqual(safeJsonParse('{"a":1}'), { a: 1 });
  assert.equal(safeJsonParse('{bad', null), null);
  assert.equal(safeJsonParse('', 42), 42);
});

test('debounce fires once after wait', async () => {
  let count = 0;
  const d = debounce(() => { count += 1; }, 30);
  d();
  d();
  d();
  assert.equal(count, 0);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(count, 1);
  d.cancel();
});
