import express from 'express';
import Expert from '../models/Expert.js';
import { spawn } from 'child_process';
import path from 'path';

const router = express.Router();

// ==========================================================================
// 1. SEARCH & AUTOSCRAPE ROUTE (SESSION-BASED VISIBILITY)
// ==========================================================================
router.get('/search', async (req, res) => {
  const { query, sessionId } = req.query; // Capture sessionId from frontend
  if (!query) return res.status(400).json({ message: "No search term provided" });

  try {
    // 1. Check database. 
    // Filter: Match query AND (is NOT temporary OR belongs to THIS session)
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
            { isTemporary: { $ne: true } }, // Visible to everyone
            { sessionId: sessionId }        // Private to this session
          ]
        }
      ]
    });

    // 2. If NO results found for this user/session, trigger the Python Scraper
    if (experts.length === 0) {
      console.log(`🔍 No local match for "${query}". Spawning scraper for session: ${sessionId}`);

      const scriptPath = path.join(process.cwd(), '..', 'scraper', 'github_scrape.py');

      /**
       * FIX: We wrap scriptPath in double quotes to handle folder names with spaces.
       * We also wrap the query to ensure multi-word searches (like "Machine Learning") 
       * are passed as a single argument.
       */
      const pythonProcess = spawn('python', [`"${scriptPath}"`, `"${query}"`, sessionId || "none"], { 
        shell: true,
        stdio: 'inherit' 
      });

      pythonProcess.on('close', async (code) => {
        console.log(`✅ Scraper process finished with exit code ${code}`);
        
        // Re-query: Only get results tagged for this user session
        const freshResults = await Expert.find({
          domain: { $regex: query, $options: 'i' },
          sessionId: sessionId
        });
        
        res.json(freshResults);
      });
    } else {
      // 3. Existing results found
      console.log(`✨ Returning ${experts.length} visible results for "${query}"`);
      res.json(experts);
    }
  } catch (err) {
    console.error('Error in /search route:', err);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// GET /api/experts - Get list of experts (Hiding temporary ones from global view)
router.get('/', async (req, res) => {
  try {
    const experts = await Expert.find({ isTemporary: { $ne: true } });
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/experts/recommendations (Hiding temporary ones)
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

// GET /api/experts/recommended (Hiding temporary ones)
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

// GET /api/experts/trending (Hiding temporary ones)
router.get('/trending', async (req, res) => {
  try {
    const experts = await Expert.find({ isTemporary: { $ne: true } }).limit(5);
    res.json(experts);
  } catch (err) {
    console.error('Error in /trending:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/experts/:id - expert by ID
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