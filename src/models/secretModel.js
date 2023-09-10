const mongoose = require('mongoose');

const secretSchema = new mongoose.Schema({
    secretID: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, maxLength: 100, index: true },
    body: { type: String, required: true, maxLength: 2048 },
    tags: [{ type: String, required: true }],

    dateCreated: { type: Date, default: Date.now },
    dateUpdated: { type: Date, default: Date.now },

    attachmentPaths: [{ type: Array, required: false }],
});

module.exports = mongoose.model('Secret', secretSchema);
