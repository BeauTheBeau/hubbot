const { EmbedBuilder } = require("discord.js");
const Logger = require('./loggingUtils');

/**
 * Enum representing the type of the embed.
 * @enum {string}
 */
const EmbedType = {
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
};

/**
 * Helper class for sending standardized embeds.
 */
class EmbedUtils {
    userModel = require('../../models/userModel');
    /**
     * Constructs a new instance of EmbedUtils.
     * @param {Logger} logger - The logger to use for logging.
     */
    constructor(logger) {
        this.logger = logger;
    }

    /**
     * Sends an embed in a standardized format as a reply to a user interaction.
     * @async
     * @param {Object} interaction - The interaction object representing the user's interaction with the bot.
     * @param {("WARNING"|"ERROR"|"INFO"|"SUCCESS")} type - The type of the embed.
     * @param {string} title - The title of the embed.
     * @param {string} description - The main content of the embed.
     * @param {boolean} [ephemeral=true] - Whether the embed should be ephemeral.
     * @param {Array} [components=[]] - The components to add to the embed.
     * @param {boolean} [edit=false] - Whether to edit the original reply instead of sending a new one.
     * @throws {Error} If an error occurs while sending the embed.
     */
    async sendEmbed(interaction, type, title, description, ephemeral = true, components = [], edit = false) {
        try {
            let colour, emoji;

            switch (type) {
                case 'WARNING':
                    colour = '#FFA500';
                    emoji = '⚠️';
                    break;
                case 'ERROR':
                    colour = '#FF0000';
                    emoji = '❌';
                    break;
                case 'SUCCESS':
                    colour = '#00FF00';
                    emoji = '✅';
                    break;
                case 'INFO':
                    colour = '#7289DA';
                    emoji = 'ℹ️';
            }

            const compact = await this.getCompactMode(interaction);
            // const compact = false;

            if (!compact) {
                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor(colour)
                    .setTimestamp();

                // Check if components is an array
                if (components && !Array.isArray(components)) throw new Error('Components must be an array.');

                try {
                    if (edit) await interaction.editReply({ embeds: [embed], ephemeral, components });
                    else await interaction.reply({ embeds: [embed], ephemeral, components });
                } catch (err) {
                    if (err.code === 10062) await interaction.editReply({embeds: [embed]});
                    if (err.code === "InteractionAlreadyReplied") await interaction.editReply({embeds: [embed]});
                    else {
                        this.logger.error(`Error sending embed: ${err.stack}`);
                        throw err;
                    }
                } finally {
                    this.logger.log(`Sent embed: ${title}`);
                }
            } else {
                await interaction.reply({
                    content: `**${emoji} ${title}**\n${description}`,
                    ephemeral,
                    components,
                });
            }
        } catch (error) {
            this.logger.error(`Error sending embed: ${error.stack}`);
            throw error;
        }
    }

    /**
     * Retrieves the user's compact mode preference.
     * @private
     * @param {Object} interaction - The interaction object representing the user's interaction with the bot.
     * @returns {Promise<{default: boolean, type: Boolean | BooleanConstructor}>} - True if compact mode is enabled; false otherwise.
     */
    async getCompactMode(interaction) {
        try {
            const users = await this.userModel.find({}).select('userID preferences.compactMode').lean();
            const user = users.find((user) => user.userID === interaction.user.id);
            if (user) return user.preferences.compactMode;
            else return false;
        } catch (error) {
            this.logger.error(`Error retrieving user preferences`);
            this.logger.error(error.stack);
            return false;
        }
    }

}

module.exports = {EmbedUtils};


