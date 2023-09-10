const { Logger } = require('../../functions/utilities/loggingUtils.js')
const logger = new Logger();

/**
 * @name handleButtons
 * @type {module}
 * @description Handle buttons
 * @param {Object} client Discord client
 */

module.exports = (client) => {

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;

        const button = client.buttons.get(interaction.customId);
        if (!button) return interaction.reply({ content: 'Whoops! Something went wrong.', ephemeral: true });

        try {
            logger.log(`Running button ${button.name}`)
            await button.execute(interaction, client);
        } catch (error) {
            logger.error(`Error running button ${button.name}: ${error}`)
            await interaction.reply({ content: 'Whoops! Something went wrong.', ephemeral: true });
        }
    });
}