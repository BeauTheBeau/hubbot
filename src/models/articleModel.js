const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    articleID: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, maxLength: 100, index: true },
    body: { type: String, required: true, maxLength: 2048 },
    tags: [{ type: String, required: true }],

    author: { type: String, required: true },
    coauthors: { type: Array, default: [] },

    dateCreated: { type: Date, default: Date.now },
    dateUpdated: { type: Date, default: Date.now },

    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

module.exports = mongoose.model('Article', articleSchema);
