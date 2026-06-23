import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost'
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;

// Initialize ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import App from './src/App';

try {
  console.log("Rendering App...");
  const html = ReactDOMServer.renderToString(<App />);
  console.log("Render successful. Length:", html.length);
} catch (e) {
  console.error("Render failed with error:", e);
}
