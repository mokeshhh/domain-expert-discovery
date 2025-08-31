import express from 'express';
import Expert from '../models/Expert.js';

const router = express.Router();

// GET /api/experts - Get list of all experts
router.get('/', async (req, res) => {
  try {
    const experts = await Expert.find();
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/experts/recommendations
router.post('/recommendations', async (req, res) => {
  let { recentSearches } = req.body;
  if (!Array.isArray(recentSearches)) recentSearches = [];

  try {
    let experts = [];

    if (recentSearches.length > 0 && recentSearches[0]) {
      experts = await Expert.find({
        $or: [
          { domain: { $regex: recentSearches[0], $options: 'i' } },
          { name: { $regex: recentSearches[0], $options: 'i' } }
        ]
      }).limit(5);
    }

    if (experts.length === 0) {
      experts = await Expert.aggregate([{ $sample: { size: 5 } }]);
    }

    res.json({ experts });
  } catch (err) {
    console.error('Error in /recommendations:', err);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
});

// GET /api/experts/recommended
router.get('/recommended', async (req, res) => {
  const search = req.query.query || '';
  try {
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { domain: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const experts = await Expert.find(filter).limit(3);
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/experts/trending
router.get('/trending', async (req, res) => {
  try {
    const experts = await Expert.find().limit(5);
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
