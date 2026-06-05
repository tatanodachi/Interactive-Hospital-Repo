import { decode } from 'open-location-code';

// The plus code needs a full code. Usually 8+ characters. 
// "RPXG+5W Jakarta".
// From Jakarta coordinates (-6.2088, 106.8456), we can recover the full code.
const OpenLocationCode = require('open-location-code').OpenLocationCode;

const olc = new OpenLocationCode();
try {
  // Let's just create a JS fetch script to use Nominatim or Google Maps with this raw string
} catch (e) {
}
