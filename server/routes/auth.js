import express from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register endpoint
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Please fill all fields.' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      savedExperts: [],
      recentSearches: [],
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) return res.status(401).json({ message: 'Invalid password.' });

    // Dummy token for demo; use real JWT in production
    const token = 'dummy-token-for-demo';
    res.json({ token, message: 'Login successful.', name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Google login endpoint
router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Google token is required.' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        password: '',
        savedExperts: [],
        recentSearches: [],
      });
      await user.save();
    }

    // Dummy token for demo; use real JWT in production
    res.json({ token: 'dummy-google-token', name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Google login token verification failed.' });
  }
});

// Get logged-in user info
router.get('/me', async (req, res) => {
  const email = req.query.email || req.headers['x-user-email'];
  if (!email) return res.status(400).json({ message: 'No user email provided.' });

  try {
    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching user info.' });
  }
});

// Save expert for logged-in user
router.post('/save-expert', async (req, res) => {
  const { email, expertId } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.savedExperts.includes(expertId)) {
      return res.status(400).json({ message: 'Expert already saved.' });
    }

    user.savedExperts.push(expertId);
    await user.save();
    res.json({ message: 'Expert saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while saving expert.' });
  }
});

// Get saved experts for logged-in user
router.get('/get-saved-experts', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ savedExperts: user.savedExperts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching saved experts.' });
  }
});

// Remove a saved expert for logged-in user
router.post('/remove-saved-expert', async (req, res) => {
  const { email, expertId } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.savedExperts = user.savedExperts.filter(id => id.toString() !== expertId);
    await user.save();
    res.json({ message: 'Expert removed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while removing expert.' });
  }
});

// Save recent search (max 10 unique)
router.post('/save-recent-search', async (req, res) => {
  const { email, searchQuery } = req.body;
  if (!email || !searchQuery) return res.status(400).json({ message: 'Email and searchQuery are required.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.recentSearches = [searchQuery, ...user.recentSearches.filter(q => q !== searchQuery)].slice(0, 10);
    await user.save();

    res.json({ message: 'Recent search saved successfully.', recentSearches: user.recentSearches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while saving recent search.' });
  }
});

// Get recent searches for user
router.get('/recent-searches', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const user = await User.findOne({ email }).select('recentSearches');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ recentSearches: user.recentSearches || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching recent searches.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
});

export default router;
