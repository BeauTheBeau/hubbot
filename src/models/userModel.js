const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true, index: true },
    guildID: { type: String, required: true },
    preferences: { compactMode: { type: Boolean, default: false } },
    lastUpdated: { type: Date, default: Date.now },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    isAuthor: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);


