const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const MAIN_URL = 'https://www.islamveihsan.com/sahabelerin-hayati.html';
const OUTPUT_FILE = path.join(__dirname, '../src/constants/companionsData.json');

// Helper to delay
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchSahabaLinks() {
  console.log(`Fetching main index from ${MAIN_URL}...`);
  try {
    const { data } = await axios.get(MAIN_URL);
    const $ = cheerio.load(data);
    
    // Most links are inside .entry-content
    // They usually follow: <li><a href="...">...</a></li> or <p><a href="...">...</a></p>
    const links = [];
    $('.entry-content a').each((i, el) => {
      let href = $(el).attr('href');
      let text = $(el).text().trim();
      
      if (href && href.startsWith('https://www.islamveihsan.com/') && href.endsWith('.html') && text) {
        // Filter out obvious noise like dates, categories, some random posts
        const lH = href.toLowerCase();
        if (lH.includes('namaz-vakti') || lH.includes('hutbe') || lH.includes('ramazan') || 
            lH.includes('sohbet') || lH.includes('oruc') || lH.includes('zayi') || 
            lH.includes('kuran-i-kerimler') || lH.includes('altinoluk')) {
            return;
        }

        links.push({ name: text, url: href });
      }
    });

    // Deduplicate array based on URL
    const uniqueLinks = Array.from(new Map(links.map(item => [item.url, item])).values());
    console.log(`Found ${uniqueLinks.length} unique Sahabe links. Extracting...`);
    return uniqueLinks;
  } catch (err) {
    console.error('Failed to fetch main index', err.message);
    return [];
  }
}

async function scrapeDetails(link) {
  try {
    const { data } = await axios.get(link.url);
    const $ = cheerio.load(data);
    
    let contentParagraphs = [];
    
    // We want the text content. It usually lives in .entry-content p
    $('.entry-content p').each((i, el) => {
      let text = $(el).text().trim();
      if (text && text.length > 30) { // filter out empty or very short random link lines
        contentParagraphs.push(text);
      }
    });

    if (contentParagraphs.length === 0) {
      // Fallback if there are no paragraphs (sometimes it's inside blockquote or div directly)
      const rawText = $('.entry-content').text().trim();
      if (rawText) {
          contentParagraphs.push(rawText.substring(0, 1000) + '... (Detailed article readable online)');
      } else {
          contentParagraphs.push("Biyografi bulunamadı.");
      }
    }

    return {
      id: link.url.split('/').pop().replace('.html', ''),
      name: link.name,
      url: link.url,
      content: contentParagraphs
    };
  } catch (err) {
    console.error(`Failed to scrape ${link.name}:`, err.message);
    return null;
  }
}

async function start() {
  const sahabaLinks = await fetchSahabaLinks();
  if (sahabaLinks.length === 0) return;

  const results = [];
  
  // Throttle the scraping to avoid anti-bot blocks
  // Parse in batches of 5
  const BATCH_SIZE = 5;
  for (let i = 0; i < sahabaLinks.length; i += BATCH_SIZE) {
    const batch = sahabaLinks.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sahabaLinks.length / BATCH_SIZE)}...`);
    
    const promises = batch.map(link => scrapeDetails(link));
    const batchResults = await Promise.all(promises);
    
    for (let res of batchResults) {
      if (res) results.push(res);
    }
    
    // Wait slightly
    await sleep(800);
  }

  // Ensure constants directory exists
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Successfully saved ${results.length} Sahaba biographies to ${OUTPUT_FILE}`);
}

start();
