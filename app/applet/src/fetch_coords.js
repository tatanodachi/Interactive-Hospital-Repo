const fetch = require('node-fetch');
// JORR W1 is Jakarta Outer Ring Road W1. Let's query nominatim.
(async () => {
    try {
        const url = 'https://nominatim.openstreetmap.org/search?q=Rawa+Buaya+Toll+Jakarta&format=json';
        const res = await fetch(url + '', { headers: { 'User-Agent': 'node' } });
        console.log(await res.json());
    } catch(e){}
})();
