const express = require('express');
const { scrapeImages, MAX_IMAGE_COUNT } = require('../../services/scraperService');
const router = express.Router();

/**
 * GET /images
 * Scrapes images from DuckDuckGo.
 */
router.get('/images', async (req, res) => {
  const { q, count, safe, offset } = req.query;

  // 1. Validate 'q' parameter
  if (!q) {
    return res.status(400).json({ error: 'The "q" parameter (search query) is required.' });
  }

  // 2. Validate and parse 'count' parameter
  let numImages = parseInt(count, 10) || 30;
  if (numImages > MAX_IMAGE_COUNT) {
    numImages = MAX_IMAGE_COUNT;
  }

  // 3. Validate and parse 'safe' parameter
  const safeSearch = parseInt(safe, 10);
  const validSafeModes = [1, 0, -1];
  const safeSearchMode = validSafeModes.includes(safeSearch) ? safeSearch : 1;

  // 4. Validate and parse 'offset' parameter
  let numOffset = parseInt(offset, 10) || 0;
  if (numOffset < 0) {
    numOffset = 0; // Offset cannot be negative
  }

  try {
    const { results, metadata } = await scrapeImages(q, numImages, safeSearchMode, numOffset);
    
    res.json({
      query: q,
      count: results.length,
      offset: numOffset, // Include offset in the response
      metadata: metadata,
      results: results,
    });

  } catch (err) {
    const statusCode = err.status || 500;
    const message = err.message || 'An internal server error occurred.';
    res.status(statusCode).json({ error: message });
  }
});

module.exports = router;
