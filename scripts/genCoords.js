import { FSA_RISK_MAP } from '../server/engine/ontarioData.js';
import fs from 'node:fs';

// Known city/area center points
const CITY_CENTROIDS = {
  'Brampton': [43.7315, -79.7624],
  'Mississauga': [43.5890, -79.6441],
  'Caledon': [43.8615, -79.8576],
  'Toronto (Scarborough)': [43.7731, -79.2577],
  'Toronto (North York)': [43.7615, -79.4111],
  'Toronto (Downtown)': [43.6532, -79.3832],
  'Toronto (Midtown)': [43.7001, -79.3900],
  'Toronto (East York)': [43.6912, -79.3272],
  'Toronto (West)': [43.6542, -79.4500],
  'Toronto (Etobicoke)': [43.6205, -79.5132],
  'Vaughan': [43.8372, -79.5083],
  'Richmond Hill': [43.8828, -79.4403],
  'Markham': [43.8561, -79.3370],
  'Newmarket': [44.0592, -79.4613],
  'Aurora': [44.0065, -79.4504],
  'Oakville': [43.4675, -79.6877],
  'Burlington': [43.3255, -79.7990],
  'Milton': [43.5183, -79.8774],
  'Pickering': [43.8384, -79.0868],
  'Ajax': [43.8509, -79.0204],
  'Whitby': [43.8975, -78.9429],
  'Oshawa': [43.8971, -78.8658],
  'Hamilton': [43.2557, -79.8711],
  'St. Catharines': [43.1594, -79.2469],
  'Niagara Falls': [43.0896, -79.0849],
  'Kitchener': [43.4516, -80.4925],
  'Waterloo': [43.4643, -80.5204],
  'Cambridge': [43.3616, -80.3144],
  'Guelph': [43.5448, -80.2482],
  'Barrie': [44.3894, -79.6903],
  'London': [42.9849, -81.2453],
  'Windsor': [42.3149, -83.0364],
  'Kingston': [44.2312, -76.4860],
  'Ottawa': [45.4215, -75.6972],
  'Ottawa (Central)': [45.4215, -75.6972],
  'Ottawa (West / Kanata)': [45.3088, -75.8986],
  'Ottawa (East / Orleans)': [45.4760, -75.5180],
  'Ottawa (South / Nepean)': [45.3450, -75.7350],
  'Peterborough': [44.3091, -78.3197],
  'Belleville': [44.1628, -77.3832],
  'Sudbury': [46.4917, -80.9930],
  'Thunder Bay': [48.3809, -89.2477]
};

// Offset generator for specific FSAs to create visually distinct cluster spreading
const fsaCoords = {};
let fsaIndex = 0;

for (const [fsa, data] of Object.entries(FSA_RISK_MAP)) {
  const cityKey = Object.keys(CITY_CENTROIDS).find(c => data.city.includes(c)) || 'Toronto (Downtown)';
  const base = CITY_CENTROIDS[cityKey] || [43.6532, -79.3832];
  
  // Deterministic slight angle offset based on FSA characters so markers don't overlap exactly
  const hash = (fsa.charCodeAt(0) * 31 + fsa.charCodeAt(1) * 17 + fsa.charCodeAt(2)) % 360;
  const angle = (hash * Math.PI) / 180;
  const radius = 0.015 + ((fsaIndex % 7) * 0.008);
  
  const lat = Math.round((base[0] + Math.sin(angle) * radius) * 10000) / 10000;
  const lng = Math.round((base[1] + Math.cos(angle) * radius * 1.3) * 10000) / 10000;
  
  fsaCoords[fsa] = [lat, lng];
  fsaIndex++;
}

const content = `// Generated FSA Geographic Coordinates for Leaflet Heatmap
export const FSA_COORDINATES = ${JSON.stringify(fsaCoords, null, 2)};
`;

fs.writeFileSync('client/src/data/fsaCoordinates.js', content, 'utf-8');
console.log('Generated client/src/data/fsaCoordinates.js with', Object.keys(fsaCoords).length, 'coordinates');
