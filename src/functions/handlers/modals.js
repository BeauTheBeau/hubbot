const {Logger} = require('../../functions/utilities/loggingUtils.js')
const logger = new Logger();

/**
 * @name handleModals
 * @type {module}
 */

module.exports = async (client) => {

    const {readdirSync} = require('fs');
    const {join} = require('path');
    const modalDirs = readdirSync(join(__dirname, '../../modals'));

    for (const dir of modalDirs) {
        const commands = readdirSync(join(__dirname, '../../modals', dir)).filter(file => file.endsWith('.js'));
        for (const file of commands) {
            const modal = require(`../../modals/${dir}/${file}`);
            await client.modals.set(modal.data.customId, modal);
            client.modalArray.push(modal.data.toJSON());
            console.log(`Loaded modal ${modal.data.customId} at ${dir}/${file}`);
        }
    }

    logger.log(`Registered ${client.modals.size} modals.`);

    client.on('interactionCreate', async interaction => {
        if (interaction.type !== 5) return

        const modal = client.modals.get(interaction.customId);
        if (!modal) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

        try {
            logger.log(`Running modal ${modal.name}`)
            await modal.execute(interaction, client);
        } catch (error) {
            logger.error(`Error running modal ${modal.name}: ${error}`)
            await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
        }
    });

}