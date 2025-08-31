import express from 'express';
const router = express.Router();

// GET /api/domains/trending - return trending domains
router.get('/trending', (req, res) => {
  res.json([
    { id: 1, name: "Artificial Intelligence", icon: "🤖" },
    { id: 2, name: "Frontend Developer", icon: "💻" },
    { id: 3, name: "Data Scientist", icon: "📊" },
    { id: 4, name: "DevOps Engineer", icon: "🔧" },
    { id: 5, name: "UI/UX Designer", icon: "🎨" }
  ]);
});

export default router;
