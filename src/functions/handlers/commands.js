require('dotenv').config();
const {Logger} = require('../utilities/loggingUtils.js')
const logger = new Logger();

const {REST, Routes, EmbedBuilder} = require('discord.js');
const token = process.env.TOKEN, clientId = process.env.CLIENT_ID;
const rest = new REST({version: '9'}).setToken(token);

const articleModel = require('../../models/articleModel.js');
const userModel = require("../../models/userModel");

/**
 * @name registerSlashCommands
 * @type {module}
 * @description Register slash commands
 * @param {Object} client Discord client
 * @param {Array} commands Array of commands to register
 */

async function registerSlashCommands(client, commands) {
    try {
        logger.log(`Started refreshing application (/) commands.`);
        await rest.put(
            Routes.applicationCommands(clientId),
            {body: commands},
        );
        logger.log(`Successfully reloaded application (/) commands.`);
    } catch (error) {
        logger.error(`Error refreshing application (/) commands`);
        logger.error(error.stack);
        throw new Error('Error refreshing application (/) commands');
    }
}

module.exports = async (client) => {

    const {readdirSync} = require('fs');
    const {join} = require('path');
    const commandDirs = readdirSync(join(__dirname, '../../commands'));

    for (const dir of commandDirs) {
        const commands = readdirSync(join(__dirname, '../../commands', dir)).filter(file => file.endsWith('.js'));
        for (const file of commands) {
            const command = require(`../../commands/${dir}/${file}`);
            await client.commands.set(command.data.name, command);
            client.commandArray.push(command.data.toJSON());
        }
    }

    await registerSlashCommands(client, client.commands.map(command => command.data.toJSON()));
    logger.log(`Registered ${client.commands.size} slash commands.`);

    client.on('interactionCreate', async interaction => {
        if (interaction.user.bot) return;

        const user = await userModel.findOne({userID: interaction.user.id, guildID: interaction.guild.id});
        if (!user) {
            const newUser = new userModel({
                userID: interaction.user.id,
                guildID: interaction.guild.id,
                lastUpdated: Date.now()
            });
            await newUser.save();
        }

        if (interaction.isModalSubmit()) {

            // createArticle_${id}_${arguments.tags}
            const modalID = interaction.customId.split('_')[0];
            const articleID = interaction.customId.split('_')[1];
            const tags = interaction.customId.split('_')[2];

            console.log(modalID, articleID, tags)

            if (modalID === 'createArticle') {

                const arguments = {
                    articleID: articleID,
                    tags: tags,
                    title: interaction.fields.getTextInputValue('title'),
                    content: interaction.fields.getTextInputValue('content'),
                    coauthors: interaction.fields.getTextInputValue('coauthor') || null,
                }

                console.log(arguments)

                try {

                    const article = await new articleModel({
                        articleID: arguments.articleID,
                        title: arguments.title,
                        body: arguments.content,
                        tags: [arguments.tags],

                        author: interaction.user.id,
                        coauthors: [arguments.coauthors],

                        dateCreated: Date.now(),
                        dateUpdated: Date.now()
                    });

                    await article.save();

                    await interaction.reply({
                        content: `Article created!`,
                        ephemeral: true
                    });

                } catch (err) {
                    logger.error(`Error creating article ${arguments.articleID}`);
                    logger.error(err.stack);
                    await interaction.reply({
                        content: `Whoops! Something went wrong.`,
                        ephemeral: true
                    });
                    throw new Error('Error creating article.');
                } finally {

                    // Send article to channel
                    const channel = await client.channels.fetch('1148380990574706852');
                    const thread = await channel.threads.create({
                        name: arguments.title,
                        autoArchiveDuration: 60,
                        reason: `Thread created by ${interaction.user.tag}`,
                        message: {
                            content: `# ${arguments.title}`
                                + `\n\n${arguments.content}`
                                + `\n\n**Author:** <@${interaction.user.id}>`
                                + `\n**Coauthors:** ${arguments.coauthors || 'None'}`
                        },
                        appliedTags: [arguments.tags]
                    });

                    const ratingEmbed = new EmbedBuilder()
                        .setTitle('Rating')
                        .setDescription('How would you rate this article?'
                            + `\n:green_square: Excellent | :yellow_square: Fair | :red_square: Poor`)
                        .setTimestamp()
                        .setFooter({ text: `Article ID: ${arguments.articleID}` });


                    const ratingMessage = await thread.send({embeds: [ratingEmbed]});
                    await ratingMessage.react('🟩');
                    await ratingMessage.react('🟨');
                    await ratingMessage.react('🟥');
                }
            }

        }
        else if (interaction.isAutocomplete()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.autocomplete(interaction);
                } catch (error) {
                    logger.error(`Error executing autocomplete for ${interaction.commandName}`);
                    logger.error(error.stack);
                }
        }
        else {

            // Check if both the user and guild are in the database
            const userModel = require(`../../models/userModel`);

            // const guildModel = require(`../../models/guildModel`);

            async function createUser() {
                try {
                    const newUser = await new userModel({
                        userID: interaction.user.id,
                        guildID: interaction.guild.id
                    });
                    await newUser.save();
                } catch (error) {
                    await interaction.reply({
                        content: 'Whoops! Something went wrong. The user could not be created.',
                        ephemeral: true
                    });
                }

            }

            async function createGuild() {
                try {
                    const newGuild = await new guildModel({
                        guildID: interaction.guild.id,
                        welcomeChannel: interaction.guild.systemChannelId,
                        welcomeMessage: `Welcome to the server, {{user}}!`,
                        leaveChannel: interaction.guild.systemChannelId,
                        leaveMessage: `{{user}} has left the server.`
                    });
                    await newGuild.save();
                } catch (error) {
                    await interaction.reply({
                        content: 'Whoops! Something went wrong. The guild could not be created.',
                        ephemeral: true
                    });
                }
            }

            // Check if the guild is in the database
            // const guild = await guildModel.findOne({guildID: interaction.guild.id});
            // if (guild === null) await createGuild();

            // Check if the user is in the database
            const user = await userModel.findOne({userID: interaction.user.id, guildID: interaction.guild.id});
            if (user === null) await createUser();

            if (!interaction.isCommand()) return;
            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});

            try {
                await command.execute(interaction, client);
            } catch (error) {
                await interaction.reply({content: 'Whoops! Something went wrong.', ephemeral: true});
            }
        }
    });
}
