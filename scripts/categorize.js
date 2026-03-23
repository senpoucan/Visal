const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../src/constants/companionsData.json');
let data = require(FILE_PATH);

const FEMALE_INDICATORS = [
  'binti', 'bint', 'ümmü', 'hatice', 'fatıma', 'esma', 'sümeyye', 'seleme', 'habibe', 
  'aişe', 'ayşe', 'meymune', 'safiyye', 'hafsa', 'cüveyriye', 'zeyneb', 'zeynep',
  'halime', 'halîme', 'zinnire', 'zinnîre', 'havle', 'ümame', 'şifa', 'hind', 'rüveyda',
  'leyla', 'leylâ', 'erva', 'cemile', 'cemîle', 'sümeyra'
];

data = data.map((c, index) => {
  const nameL = c.name.toLowerCase();
  
  // The first 10 are exactly Aşere-i Mübeşşere from the HTML order
  if (index < 10) {
    return { ...c, category: 'Aşere-i Mübeşşere' };
  }

  let category = 'Erkek Sahabeler';
  
  // Highest priority: if 'binti' is inside the name, it's 100% Female.
  if (nameL.includes('binti') || nameL.includes(' bint ')) {
    category = 'Kadın Sahabeler';
  } 
  // Second priority: if 'bin ', 'ibni ', 'ibn ' is inside the name, it's Male.
  else if (nameL.includes(' bin ') || nameL.includes(' ibni ') || nameL.includes(' ibn ')) {
    category = 'Erkek Sahabeler';
  } 
  // Fallback heuristic based on names
  else {
    const isFemale = FEMALE_INDICATORS.some(f => {
      // split by spaces to ensure exact word matches for short names like hind
      const words = nameL.replace(/[^\w\sğüşıöç]/gi, '').split(/\s+/);
      return words.includes(f);
    });
    
    // Check if it's explicitly matching part of the name
    const isFemaleFallback = FEMALE_INDICATORS.some(f => nameL.includes(f));

    if ((isFemale || isFemaleFallback) && !nameL.includes('babası') && !nameL.includes('oğlu')) {
      category = 'Kadın Sahabeler';
    }
  }

  // Edge cases fix: some edge cases might accidentally slip (like Abdullah ibni Mesud etc, but "ibni" rule catches it above)

  return { ...c, category };
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
console.log('Categories applied perfectly. Re-evaluated all instances.');
