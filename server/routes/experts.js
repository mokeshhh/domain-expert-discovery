const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Expert = require('../models/Expert');

// GET /api/experts - Get list of all experts
router.get('/', async (req, res) => {
  try {
    const experts = await Expert.find();
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// NEW - POST /api/experts/recommendations
// Accepts recentSearches array in body and returns experts matching latest recent search or random fallback
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

    // Fallback: if no matches or no recent searches, return 5 random experts
    if (experts.length === 0) {
      experts = await Expert.aggregate([{ $sample: { size: 5 } }]);
    }

    res.json({ experts });
  } catch (err) {
    console.error('Error in /recommendations:', err);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
});

// NEW - GET /api/experts/recommended
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

// NEW - GET /api/experts/trending
router.get('/trending', async (req, res) => {
  try {
    const experts = await Expert.find().limit(5);
    res.json(experts);
  } catch (err) {
    console.error('Error in /trending:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dynamic expert by ID - LAST route
router.get('/:id', async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ message: 'Expert not found' });
    res.json(expert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
