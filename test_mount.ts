import { JSDOM } from 'jsdom';

const dom = new JSDOM('<div id="root"></div>', {
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
  const { createRoot } = (await import('react-dom/client'));
  const App = (await import('./src/App')).default;

  try {
    console.log("Mounting App...");
    const root = createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
    
    setTimeout(() => {
        console.log("App remains mounted.");
    }, 2000);
  } catch (e) {
    console.error("Mount failed with error:", e);
  }
}

run();
