const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
  // From Wikipedia scraper
  name: { type: String, required: true },
  domain: { type: String },
  skills: { type: [String] },
  rating: { type: Number },
  projects: { type: Number },
  about: { type: String },
  avatar: { type: String },

  // From GitHub scraper
  username: { type: String },
  bio: { type: String },
  location: { type: String },
  profile_url: { type: String },

  // New LinkedIn field
  linkedin_url: { type: String }
});

module.exports = mongoose.model('Expert', ExpertSchema);
