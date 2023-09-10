const {SlashCommandBuilder, PermissionsBitField} = require("discord.js");
const {Logger} = require("../../functions/utilities/loggingUtils.js");
const {EmbedUtils} = require("../../functions/utilities/embedUtils");
const logger = new Logger();
const userModel = require('../../models/userModel.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('author')
        .setDescription('Gives or removes the author role.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to give or remove the author role from.')
            .setRequired(true)
        ),

    async execute(interaction) {


        const arguments = {
            executor: interaction.user,
            user: interaction.options.getUser('user')
        }

        try {
            let user = await userModel.findOne({userID: interaction.user.id, guildID: interaction.guild.id});
            if (!user) {
                const newUser = new userModel({
                    userID: interaction.user.id,
                    guildID: interaction.guild.id,
                    lastUpdated: Date.now()
                });
                await newUser.save();
                user = newUser;
            }

            if (user.isAuthor) {
                user.isAuthor = false;
                await user.save();
                return interaction.reply({
                    content: `Removed **author** from ${arguments.user.username}.`,
                    ephemeral: true
                });
            }

            user.isAuthor = true;
            await user.save();
            return interaction.reply({content: `Gave **author** to ${arguments.user.username}.`, ephemeral: true});
        } catch (err) {
            logger.error(`An error occurred while executing the author command`);
            logger.error(err.stack);
            return interaction.reply({content: 'An error occurred while executing this command.', ephemeral: true});
        }

    }


}

