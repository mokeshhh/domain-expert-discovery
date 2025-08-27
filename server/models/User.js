const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String},
  savedExperts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expert' }],
  recentSearches: {
    type: [String], // Array of search query strings
    default: [],
  },
});

module.exports = mongoose.model('User', userSchema);
