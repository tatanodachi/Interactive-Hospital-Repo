const fetch = require('node-fetch');

(async () => {
    try {
        const url = 'https://nominatim.openstreetmap.org/search?q=RPXG%2B5W+West+Cengkareng&format=json';
        const res = await fetch(url, { headers: { 'User-Agent': 'node' } });
        console.log(await res.json());
    } catch(e){ console.error(e) }
})();
