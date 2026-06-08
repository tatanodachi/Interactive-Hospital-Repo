import https from "node:https";
import fs from "node:fs";

const query = `[out:json][timeout:60];(way["highway"="motorway"](-6.4,106.5,-6.0,107.0);way["highway"="motorway_link"](-6.4,106.5,-6.0,107.0););out geom;`;
const url = "https://overpass-api.de/api/interpreter";

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      JSON.parse(data);
      fs.writeFileSync('public/toll_roads.json', data);
      console.log('Successfully saved to public/toll_roads.json');
    } catch(e) {
      console.error('Failed to parse (Response first 500 chars):');
      console.error(data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error("Request error:", e);
});

req.write("data=" + encodeURIComponent(query));
req.end();
