const axios = require('axios');
const delay = require('../utils/delay');

// Load environment variables
const USER_AGENT = process.env.USER_AGENT;
const REQUEST_DELAY_MS = parseInt(process.env.REQUEST_DELAY_MS, 10);
const MAX_IMAGE_COUNT = parseInt(process.env.MAX_IMAGE_COUNT, 10);

const vqdCache = new Map();
const VQD_CACHE_TTL_MS = 10 * 60 * 1000; // Cache tokens for 10 minutes

const http = axios.create({
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': USER_AGENT,
    'Referer': 'https://duckduckgo.com/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  },
});

/**
 * Extracts the vqd token required for API calls from the DuckDuckGo search page.
 * Uses an in-memory cache to avoid fetching a new token for the same query repeatedly.
 * @param {string} query - The search keyword.
 * @returns {Promise<string>} The vqd token.
 */
const getVqdToken = async (query) => {
  if (vqdCache.has(query)) {
    const cachedEntry = vqdCache.get(query);
    if (Date.now() < cachedEntry.expiresAt) {
      console.log(`Using cached vqd token for query: "${query}"`);
      return cachedEntry.token;
    }
  }

  try {
    console.log(`Fetching new vqd token for query: "${query}"`);
    const response = await http.get('https://duckduckgo.com/', {
      params: { q: query, ia: 'web' },
    });
    
    const vqdRegex = /vqd=([\d-]+)/;
    const match = response.data.match(vqdRegex);

    if (match && match[1]) {
      const token = match[1];
      vqdCache.set(query, {
        token: token,
        expiresAt: Date.now() + VQD_CACHE_TTL_MS,
      });
      console.log(`Successfully extracted and cached vqd token: ${token}`);
      return token;
    }
    
    throw new Error('Failed to extract vqd token. DDG may have changed their layout.');
  } catch (error) {
    console.error('Error fetching vqd token:', error.message);
    throw new Error('Could not fetch vqd token from DuckDuckGo.');
  }
};

/**
 * Scrapes images from DuckDuckGo based on a query, with support for an offset.
 * @param {string} query - The search keyword.
 * @param {number} count - The desired number of images.
 * @param {number} safeSearch - Safe search mode.
 * @param {number} offset - The number of results to skip.
 * @returns {Promise<object>} An object containing results and metadata.
 */
const scrapeImages = async (query, count, safeSearch, offset) => {
  const startTime = Date.now();
  let vqd;

  try {
    vqd = await getVqdToken(query);
  } catch (error) {
    throw { status: 502, message: error.message };
  }
  
  const results = [];
  let pagesScraped = 0;
  
  const safeSearchParam = safeSearch === 0 ? '-2' : (safeSearch === -1 ? '-1' : '1');

  // ** NEW: Set the initial parameters, including the offset ('s') **
  let params = {
    l: 'us-en',
    o: 'json',
    q: query,
    vqd: vqd,
    f: ',,,',
    p: safeSearchParam,
    s: offset, // This tells DDG how many results to skip
  };

  while (results.length < count) {
    try {
      pagesScraped++;
      const response = await http.get('https://duckduckgo.com/i.js', { params });
      
      if (!response.data || !response.data.results || response.data.results.length === 0) {
        break;
      }
      
      const newResults = response.data.results.map(r => ({
        title: r.title,
        image: r.image,
        thumbnail: r.thumbnail,
        width: r.width,
        height: r.height,
        source: r.source,
        page_url: r.url,
      }));
      
      results.push(...newResults);

      if (response.data.next) {
        const nextUrl = new URL(`https://duckduckgo.com${response.data.next}`);
        params = Object.fromEntries(nextUrl.searchParams.entries());
        await delay(REQUEST_DELAY_MS);
      } else {
        break;
      }
    } catch (error) {
        if (error.response) {
            console.error(`DDG API request failed with status: ${error.response.status}`);
            if (error.response.status === 429) {
                throw { status: 429, message: 'Rate limited by DuckDuckGo.' };
            }
        } else {
            console.error('Error fetching image results:', error.message);
        }
        throw { status: 502, message: 'Failed to fetch results from DuckDuckGo.' };
    }
  }

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Scraped ${results.length} images for query "${query}" with offset ${offset} in ${elapsedTime}s.`);
  
  return {
    results: results.slice(0, count),
    metadata: {
        elapsedTime: `${elapsedTime}s`,
        pagesScraped: pagesScraped,
    }
  };
};

module.exports = {
  scrapeImages,
  MAX_IMAGE_COUNT,
};
