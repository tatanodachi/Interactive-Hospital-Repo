import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost'
});
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

async function run() {
  const React = (await import('react')).default;
  const ReactDOMServer = (await import('react-dom/server')).default;
  const App = (await import('./src/App')).default;

  try {
    console.log("Rendering App...");
    const html = ReactDOMServer.renderToString(React.createElement(App));
    console.log("Render successful. Length:", html.length);
  } catch (e) {
    console.error("Render failed with error:", e);
  }
}

run();
