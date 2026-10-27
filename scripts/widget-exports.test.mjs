import test from 'node:test';
import assert from 'node:assert/strict';
import * as widget from '../inf-product-carousel-widget.js';

const REQUIRED_EXPORTS = [
  'assertMountConfig',
  'expandMountConfigs',
  'buildItemEventName',
  'resolveRecommendApiUrl',
  'safeJsonParse',
  'debounce',
  'convertBrandConfig',
  'isValidRecommendationData',
  'buildWidgetCacheKey',
  'buildProductClickGaPayload',
  'buildNavClickGaPayload',
  'resolveNavDisplayMode',
  'buildMktClickPayload',
  'resolveProductImageUrl'
];

test('widget module exports all public helpers', () => {
  for (const name of REQUIRED_EXPORTS) {
    assert.equal(typeof widget[name], 'function', `missing export: ${name}`);
  }
});

test('browser globals are not defined in Node import', () => {
  assert.equal(typeof globalThis.InfFitsProductCarousel, 'undefined');
  assert.equal(typeof globalThis.customElements, 'undefined');
});
