import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  savedExperts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expert' }],
  recentSearches: {
    type: [String], // Array of search query strings
    default: [],
  },
});

const User = mongoose.model('User', userSchema);
export default User;
