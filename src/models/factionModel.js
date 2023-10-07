const mongoose = require('mongoose')

const factionSchema = new mongoose.Schema({

    // Basic data
    name: { type: String, required: true, index: true },
    owner: { type: String, required: true, index: true },
    ownerId: { type: String, required: true },
    guildID: { type: String, required: true },
    locked: { type: Boolean, default: false },

    // Faction data
    description: { type: String, required: false },
    members: { type: Array, required: false },
    invites: { type: Array, required: false },
    allies: { type: Array, required: false },
    enemies: { type: Array, required: false },
    neutral: { type: Array, required: false },

    // Faction stats
    wars: { type: Number, required: false },
    wins: { type: Number, required: false },
    losses: { type: Number, required: false },
    draws: { type: Number, required: false },

    // FE: Faction Exchange
    blacklisted: { type: Boolean, required: false },
    blacklistReason: { type: String, required: false },
    partnered: { type: Boolean, required: false },
    exclusive: { type: Boolean, required: false },

    // FE: Map Lore
    territory: { type: Array, required: false },
    history: { type: String, required: false },
    participating: { type: Boolean, default: false }

});

module.exports = mongoose.model('Faction', factionSchema)