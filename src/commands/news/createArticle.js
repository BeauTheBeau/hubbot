const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const {EmbedUtils} = require('../../functions/utilities/embedUtils');
const {Logger} = require('../../functions/utilities/loggingUtils.js')
const logger = new Logger();
const embedUtils = new EmbedUtils(logger);

const userModel = require('../../models/userModel.js');
const articleModel = require('../../models/articleModel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('article')
        .setDescription('Publishes an article.')
        .addStringOption(option => option
            .setName('type')
            .setDescription('Type of article.')
            .addChoices(
                { name: 'Senior', value: '1148380990574706852' },
                { name: 'Junior', value: '1148693718782713896' }
            )
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('tags')
            .setDescription('Tags for the article.')
            .setRequired(true)
            .setAutocomplete(true)
        ),

    async autocomplete(interaction) {

        const channel = await interaction.guild.channels.cache.get(interaction.options.getString('type'));
        if (!channel) return;

        const focusedValue = interaction.options.getFocused();
        const availableTags = channel.availableTags;
        const tags = availableTags.map(tag => tag.name);

        let options = [];
        for (const tag of tags) options.push(`${tag}`);
        const filtered = options.filter(option => option.startsWith(focusedValue));

        await interaction.respond(filtered.map(option => ({ name: option, value: option })));
    },
    async execute(interaction) {

        const arguments = {
            tags: interaction.options.getString('tags'),
            user: interaction.user
        }

        try {
            const users = await userModel.find({}).select('userID isAuthor').lean();
            const user = users.find((user) => user.userID === interaction.user.id);

            if (!user.isAuthor) {
                return embedUtils.sendEmbed(interaction, 'WARNING',
                    'You are not an author.', 'You must be an author to publish articles.');
            }
        } catch (err) {
            logger.error(`Error finding user ${interaction.user.id}`);
            logger.error(err.stack);
            await embedUtils.sendEmbed(interaction, 'ERROR',
                'Failed to find user.', 'Whoops! Something went wrong.');
            throw new Error('Failed to find user.');
        }

        let id = await articleModel.countDocuments() + 1;
        while (await articleModel.exists({articleID: id})) {
            id++;
        }

        try {

            const modal = new ModalBuilder()
                .setCustomId(`createArticle_${id}_${arguments.tags}`)
                .setTitle('Create Article')

            const titleInput = new TextInputBuilder()
                .setLabel('Title')
                .setPlaceholder('Enter the title of the article.')
                .setStyle(TextInputStyle.Short)
                .setCustomId('title')
                .setMinLength(16)
                .setMaxLength(100)
                .setRequired(true)

            const contentInput = new TextInputBuilder()
                .setLabel('Content')
                .setPlaceholder('Enter the content of the article.')
                .setStyle(TextInputStyle.Paragraph)
                .setCustomId('content')
                .setMinLength(32)
                .setMaxLength(2000)
                .setRequired(true)

            const coauthorInput = new TextInputBuilder()
                .setLabel('Coauthor')
                .setPlaceholder('Enter article coauthors.')
                .setStyle(TextInputStyle.Short)
                .setCustomId('coauthor')
                .setMinLength(4)
                .setMaxLength(32)
                .setRequired(false)

            const rows = [
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(contentInput),
                new ActionRowBuilder().addComponents(coauthorInput)
            ]

            for (const row of rows) modal.addComponents(row);

            await interaction.showModal(modal);

        } catch (err) {
            logger.error(err.stack);
            await embedUtils.sendEmbed(interaction, 'ERROR', 'Failed to create modal.', 'Whoops! Something went wrong.');
            throw new Error('Failed to create modal.');

        }


    }
}