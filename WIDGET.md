# InfFits Product Carousel Widget

```js
await import('https://ts-inf-product-carousel-component.vercel.app/inf-product-carousel-widget.js');
window.InfFitsProductCarousel.mount({ brand: 'DES', GA4Key: 'G-xxx', carousels: [/* 同 USAGE.md */] });
```

參數見 [USAGE.md](./USAGE.md)，GA4 見 [GA4.md](./GA4.md)。  
本機示範：[demo-widget.html](./demo-widget.html)。

舊版 `inf-product-carousel-component.js` 仍可用，與本 widget **互不依賴**（custom element tag 不同，可同頁並存）。
