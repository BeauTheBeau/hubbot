// Import modules
// =====================================================================================================================
require('dotenv').config();

const {Client, GatewayIntentBits, Collection} = require('discord.js');
const process = require(`node:process`)
const {Logger} = require('./functions/utilities/loggingUtils.js')
const mongoose = require('mongoose');

const logger = new Logger();
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b, 0),
});

const startTimestamp = Date.now();
client.commands = new Collection();
client.events = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.commandArray = [];
client.buttonArray = [];
client.modalArray = [];

// Initialization
// =====================================================================================================================

async function initializeHandlers() {

    logger.log(`Initializing handlers...   [0/3]`)
    logger.log(`Initializing handlers...   [1/4]`)
    await require('./functions/handlers/commands.js')(client)

    logger.log(`Initializing modals...     [2/4]`)
    // await require('./functions/handlers/modals.js')(client)

    logger.log(`Initializing events...     [3/4]`)
    await require('./functions/handlers/events.js')(client)

    logger.log(`Initializing buttons...    [4/4]`)
    // await require('./functions/handlers/buttons.js')(client)

    logger.log(`Handlers initialized!`)

}

// Initialize client
// =====================================================================================================================
async function initializeClient() {
    logger.log(`Initializing client...`)
    try {
        await client.login(process.env.TOKEN);
        logger.log(`Client initialized, took ${Date.now() - startTimestamp}ms!`)
        logger.log(`Logged in as ${client.user.tag}!`);
    } catch (err) {
        logger.error(`Client initialization failed`);
        logger.error(err.stack);
        throw new Error('Client initialization failed.');
    }
}

// Initialize database
// =====================================================================================================================
async function initializeDatabase() {
    logger.log(`Initializing database...`)

    const mongoURL = process.env.MONGO_URL;
    mongoose.set(`strictQuery`, true);

    try {
        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.log(`Database initialized!`)
    } catch (err) {
        logger.error(`Database initialization failed`);
        logger.error(err.stack);
        throw new Error('Database initialization failed.');
    }
}

// Initialize client
// =====================================================================================================================
(async () => {
    try {
        await initializeDatabase();
        logger.log(``)
        await initializeHandlers();
        logger.log(``)
        await initializeClient();
        logger.log(``)
    } catch (err) {
        logger.error(`Initialization failed`);
        logger.error(err.stack);
        process.exit(1);
    }
})();


// Error handling
// =====================================================================================================================
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled promise rejection`);
    logger.error(err.stack);
});

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception`);
    logger.error(err.stack);
});
