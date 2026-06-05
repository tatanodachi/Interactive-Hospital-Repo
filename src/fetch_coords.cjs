const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
    try {
        const url = 'https://nominatim.openstreetmap.org/search?q=RPXG%2B5W+Jakarta&format=json';
        const res = await fetch(url, { headers: { 'User-Agent': 'node' } });
        console.log(await res.json());
        
        const url2 = 'https://nominatim.openstreetmap.org/search?q=Gerbang+Tol+Rawa+Buaya&format=json';
        const res2 = await fetch(url2, { headers: { 'User-Agent': 'node' } });
        console.log(await res2.json());
    } catch(e){ console.error(e) }
})();
