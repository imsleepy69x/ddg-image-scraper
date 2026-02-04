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
  if (typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ error: 'The "q" parameter (search query) is required.' });
  }

  // 2. Validate and parse 'count' parameter
  let numImages = 30;
  if (count !== undefined) {
    const parsedCount = Number.parseInt(count, 10);
    if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
      return res.status(400).json({ error: 'The "count" parameter must be a positive integer.' });
    }
    numImages = parsedCount;
  }
  if (numImages > MAX_IMAGE_COUNT) {
    numImages = MAX_IMAGE_COUNT;
  }

  // 3. Validate and parse 'safe' parameter
  const validSafeModes = [1, 0, -1];
  let safeSearchMode = 1;
  if (safe !== undefined) {
    const safeSearch = Number.parseInt(safe, 10);
    if (!Number.isInteger(safeSearch) || !validSafeModes.includes(safeSearch)) {
      return res.status(400).json({ error: 'The "safe" parameter must be one of: 1, 0, -1.' });
    }
    safeSearchMode = safeSearch;
  }

  // 4. Validate and parse 'offset' parameter
  let numOffset = 0;
  if (offset !== undefined) {
    const parsedOffset = Number.parseInt(offset, 10);
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ error: 'The "offset" parameter must be a non-negative integer.' });
    }
    numOffset = parsedOffset;
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
    const responseBody = { error: message };
    if (err.details) {
      responseBody.details = err.details;
    }
    if (err.retryAfter) {
      responseBody.retryAfter = err.retryAfter;
    }
    res.status(statusCode).json(responseBody);
  }
});

module.exports = router;
