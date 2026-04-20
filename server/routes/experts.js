import express from 'express';
import Expert from '../models/Expert.js';
import { runScraper } from '../scraper/githubScraper.js';

const router = express.Router();

// ==========================================================================
// 1. SEARCH & AUTOSCRAPE ROUTE (SESSION-BASED VISIBILITY)
// ==========================================================================
router.get('/search', async (req, res) => {
  const { query, sessionId } = req.query;
  if (!query) return res.status(400).json({ message: "No search term provided" });

  try {
    let experts = await Expert.find({
      $and: [
        {
          $or: [
            { domain: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } }
          ]
        },
        {
          $or: [
            { isTemporary: { $ne: true } },
            { sessionId: sessionId }
          ]
        }
      ]
    });

    if (experts.length === 0) {
      console.log(`🔍 No local match for "${query}". Running JS scraper for session: ${sessionId}`);

      // ✅ await so scraper fully finishes before re-querying
      await runScraper(query, sessionId || 'none');

      // ✅ Re-query after scraper finishes — sends fresh results to frontend
      const freshResults = await Expert.find({
        $and: [
          {
            $or: [
              { domain: { $regex: query, $options: 'i' } },
              { name: { $regex: query, $options: 'i' } }
            ]
          },
          {
            $or: [
              { isTemporary: { $ne: true } },
              { sessionId: sessionId }
            ]
          }
        ]
      });

      console.log(`📤 Sending ${freshResults.length} fresh results to frontend`);
      return res.json(freshResults);
    }

    console.log(`✨ Returning ${experts.length} visible results for "${query}"`);
    res.json(experts);

  } catch (err) {
    console.error('Error in /search route:', err);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// ==========================================================================
// 2. GET ALL EXPERTS (hide temporary ones from global view)
// ==========================================================================
router.get('/', async (req, res) => {
  try {
    const experts = await Expert.find({ isTemporary: { $ne: true } });
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================================
// 3. RECOMMENDATIONS
// ==========================================================================
router.post('/recommendations', async (req, res) => {
  let { recentSearches } = req.body;
  if (!Array.isArray(recentSearches)) recentSearches = [];

  try {
    let experts = [];

    if (recentSearches.length > 0 && recentSearches[0]) {
      experts = await Expert.find({
        $and: [
          {
            $or: [
              { domain: { $regex: recentSearches[0], $options: 'i' } },
              { name: { $regex: recentSearches[0], $options: 'i' } }
            ]
          },
          { isTemporary: { $ne: true } }
        ]
      }).limit(5);
    }

    if (experts.length === 0) {
      experts = await Expert.aggregate([
        { $match: { isTemporary: { $ne: true } } },
        { $sample: { size: 5 } }
      ]);
    }

    res.json({ experts });
  } catch (err) {
    console.error('Error in /recommendations:', err);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
});

// ==========================================================================
// 4. RECOMMENDED (search-based, hide temporary)
// ==========================================================================
router.get('/recommended', async (req, res) => {
  const search = req.query.query || '';
  try {
    const filter = {
      $and: [
        { isTemporary: { $ne: true } },
        search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { domain: { $regex: search, $options: 'i' } },
          ],
        } : {}
      ]
    };
    const experts = await Expert.find(filter).limit(3);
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================================================
// 5. TRENDING (hide temporary)
// ==========================================================================
router.get('/trending', async (req, res) => {
  try {
    const experts = await Expert.find({ isTemporary: { $ne: true } }).limit(5);
    res.json(experts);
  } catch (err) {
    console.error('Error in /trending:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================================================
// 6. GET EXPERT BY ID (must be last to avoid catching other routes)
// ==========================================================================
router.get('/:id', async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ message: 'Expert not found' });
    res.json(expert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;