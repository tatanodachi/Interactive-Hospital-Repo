const {OpenLocationCode} = require('open-location-code');

const olc = new OpenLocationCode();
// Recover using a reference location (e.g. general Jakarta coordinates)
const fullCode = olc.recoverNearest("RPXG+5W", -6.155, 106.742);
const decoded = olc.decode(fullCode);
console.log(decoded);
