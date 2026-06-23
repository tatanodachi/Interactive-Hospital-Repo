import { JSDOM } from 'jsdom';

async function run() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost:3000/',
    runScripts: 'dangerously',
    resources: 'usable'
  });
  
  dom.window.addEventListener('error', (event) => {
    console.error('JSDOM Error Event:', event.error, event.message);
  });
  
  dom.window.addEventListener('unhandledrejection', (event) => {
    console.error('JSDOM Unhandled Rejection:', event.reason);
  });

  // Load the scripts as in index.html
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  dom.window.document.write(html);
  
  setTimeout(() => {
    console.log('Finished waiting.');
    dom.window.close();
  }, 10000);
}
run();
