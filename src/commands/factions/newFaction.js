const factionModel = require('../../models/factionModel.js');
const {
    SlashCommandBuilder,
    ComponentType,
    EmbedBuilder,
    ActionRowBuilder,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');


function sendUpdate(faction, action = 'create', data = {}, interaction) {
    const actions = {create: 'created', delete: 'deleted', join: 'joined', leave: 'left'}
    let embed;

    switch (action) {

        case 'create':
            embed = new EmbedBuilder()
                .setTitle(`${faction.name} ${actions[action]}!`)
                .setDescription(`<@${data.owner}> has successfully ${actions[action]} the faction ${faction.name}.`
                    + `\n**Description:** ${faction.description}`)
            break;

        case 'delete':
            embed = new EmbedBuilder()
                .setTitle(`${faction.name} ${actions[action]}!`)
                .setDescription(`<@${data.member}> has successfully ${actions[action]} the faction ${faction.name}.`)
            break;

        case 'join':
            embed = new EmbedBuilder()
                .setTitle(`${faction.name} ${actions[action]}!`)
                .setDescription(`<@${data.member}> has successfully ${actions[action]} the faction ${faction.name}.`
                    + `\n**Description:** ${faction.description}`)
            break;

        case 'leave':
            embed = new EmbedBuilder()
                .setTitle(`${faction.name} ${actions[action]}!`)
                .setDescription(`<@${data.member}> has successfully ${actions[action]} the faction ${faction.name}.`
                    + `They now have ${faction.members.length} members.`)
            break;

        default:
            embed = new EmbedBuilder()
                .setTitle(`${faction.name} ${actions[action]}!`)
                .setDescription(`<@${data.user}> has successfully ${actions[action]} the faction ${faction.name}.`
                    + `They now have ${faction.members.length} members.`)
            break;
    }

    // get channel with ID 1159215080328659104
    const channel = interaction.guild.channels.cache.get('1159215080328659104');
    channel.send({embeds: [embed]});

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faction')
        .setDescription('Create, edit, or delete a faction.')

        .addSubcommand(subcommand => subcommand
            .setName('create')
            .setDescription('Create a new faction.')
            .addStringOption(option => option
                .setName('owner')
                .setDescription('The owner of the faction. Use their user ID, default is you.')
                .setRequired(false))
            .addBooleanOption(option => option
                .setName('dry-run')
                .setDescription('If this is true, the faction will not be created.')
                .setRequired(false))
        )

        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Delete a faction.')
            .addStringOption(option => option
                .setName('name')
                .setDescription('The name of the faction.')
                .setAutocomplete(true)
                .setRequired(true))
            .addStringOption(option => option
                .setName('confirm')
                .setDescription('Re-type the name of the faction to confirm.')
                .setRequired(true))
        )

        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('List all factions.')
        )

        .addSubcommand(subcommand => subcommand
            .setName('about')
            .setDescription('Get information about a faction.')
            .addStringOption(option => option
                .setName('name')
                .setDescription('The name of the faction.')
                .setAutocomplete(true)
                .setRequired(true))
        )

        .addSubcommand(subcommand => subcommand
            .setName('join')
            .setDescription('Join a faction.')
            .addStringOption(option => option
                .setName('name')
                .setDescription('The name of the faction.')
                .setAutocomplete(true)
                .setRequired(true))
        )

        .addSubcommand(subcommand => subcommand
            .setName('leave')
            .setDescription('Leave a faction.')
            .addStringOption(option => option
                .setName('name')
                .setDescription('The name of the faction.')
                .setAutocomplete(true)
                .setRequired(true))
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused();
        let choices;
        if (interaction.options.getSubcommand() === 'delete') choices = await factionModel.find({guildID: interaction.guild.id, ownerId: interaction.user.id});
        else choices = await factionModel.find({guildID: interaction.guild.id});
        const filteredChoices = choices.filter(choice => choice.name.toLowerCase().includes(focusedOption.toLowerCase()));
        await interaction.respond(filteredChoices.map(choice => ({name: choice.name, value: choice.name})));
    },

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const data = {
            name: interaction.options.getString('name'),
            confirm: interaction.options.getString('confirm'),
            description: interaction.options.getString('description'),
            owner: interaction.options.getString('owner'),
            member: interaction.user.id,
            dryRun: interaction.options.getBoolean('dry-run')
        };

        if (data.owner !== data.member && data.member !== `729567972070391848`) return await interaction.reply({
            content: 'You can not create a faction for someone else.',
            ephemeral: true
        });

        if (subcommand === 'create') {

            const createFactionModal = new ModalBuilder()
                .setCustomId(`createFactionModal-${interaction.user.id}`)
                .setTitle('Create a new faction')

            const nameInput = new TextInputBuilder()
                .setCustomId('nameInput')
                .setLabel('Enter the name of your faction')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(32);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('descriptionInput')
                .setLabel('Enter a description for your faction')
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(1024);

            const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

            createFactionModal.addComponents(firstActionRow, secondActionRow);
            await interaction.showModal(createFactionModal);

            const filter = (interaction) => interaction.user.id === interaction.user.id;
            const submitted = await interaction.awaitModalSubmit({
                time: 600_000, filter
            })

            if (!submitted) return await interaction.reply({ content: 'You did not respond in time (60 minutes).', ephemeral: true });

            data.name = submitted.fields.getTextInputValue('nameInput');
            data.description = submitted.fields.getTextInputValue('descriptionInput');

            const newFaction = new factionModel({
                name: data.name,
                description: data.description,
                owner: data.owner || interaction.user.id,
                ownerId: data.owner || interaction.user.id,
                guildID: interaction.guild.id,
                members: [data.owner || interaction.user.id],
            });


            if (!data.dryRun) await newFaction.save();

            const embed = new EmbedBuilder()
                .setTitle(`${data.name} created!`)
                .setDescription(
                    `You have successfully created the faction ${data.name}.`
                    + `\n\n**Description:** ${data.description}`
                    + `\n**Owner:** <@${data.owner || interaction.user.id}>`
                )
                .setFooter({text: `Dry run: ${data.dryRun ? 'true' : 'false'}`})

            await submitted.reply({embeds: [embed], ephemeral: true});


            if (!data.dryRun) sendUpdate(newFaction, 'create', data, interaction)
        } else if (subcommand === 'join') {

            // Check if the faction exists
            const faction = await factionModel.findOne({name: data.name, guildID: interaction.guild.id});
            if (!faction) return await interaction.reply({content: 'That faction does not exist.', ephemeral: true});

            // Check if the user is already in the faction
            if (faction.members.includes(interaction.user.id)) return await interaction.reply({
                content: 'You are already in that faction.',
                ephemeral: true
            });
            if (faction.locked) return await interaction.reply({content: 'That faction is locked.', ephemeral: true});

            // Add the user to the faction
            faction.members.push(interaction.user.id);
            await faction.save();

            const embed = new EmbedBuilder()
                .setTitle(`${data.name} joined!`)
                .setDescription(
                    `You have successfully joined the faction ${data.name}.`
                    + `\n\n**Description:** ${faction.description}`
                    + `\n**Owner:** <@${faction.ownerId}>`
                )

            sendUpdate(faction, 'join', data, interaction)
            await interaction.reply({embeds: [embed], ephemeral: true});
        } else if (subcommand === 'leave') {

            // Check if the faction exists
            const faction = await factionModel.findOne({name: data.name, guildID: interaction.guild.id});
            if (!faction) return await interaction.reply({content: 'That faction does not exist.', ephemeral: true});

            // Check if the user is in the faction
            if (!faction.members.includes(interaction.user.id)) return await interaction.reply({
                content: 'You are not in that faction.',
                ephemeral: true
            });

            // Remove the userfrom the faction
            faction.members.splice(faction.members.indexOf(interaction.user.id), 1);
            await faction.save();

            const embed = new EmbedBuilder()
                .setTitle(`${data.name} left!`)
                .setDescription(
                    `You have successfully left the faction ${data.name}.`
                    + `\n\n**Description:** ${faction.description}`
                    + `\n**Owner:** <@${faction.ownerId}>`
                )

            sendUpdate(faction, 'leave', data, interaction)
            await interaction.reply({embeds: [embed], ephemeral: true});
        } else if (subcommand === 'delete') {

            // Check if the faction exists
            const faction = await factionModel.findOne({name: data.name, guildID: interaction.guild.id});
            if (!faction) return await interaction.reply({content: 'That faction does not exist.', ephemeral: true});

            // Check if the user is the owner of the faction and if they confirmed the deletion
            if (faction.ownerId !== interaction.user.id) return await interaction.reply({
                content: 'You are not the owner of that faction.',
                ephemeral: true
            });
            if (data.confirm !== data.name) return await interaction.reply({
                content: 'You did not confirm the deletion.',
                ephemeral: true
            });

            await factionModel.deleteOne({name: data.name, guildID: interaction.guild.id});

            const embed = new EmbedBuilder()
                .setTitle(`${data.name} deleted!`)
                .setDescription(`You have successfully deleted the faction ${data.name}.`)

            sendUpdate(faction, 'delete', data, interaction)
            await interaction.reply({embeds: [embed], ephemeral: true});
        } else if (subcommand === 'list') {

            // Check if there are any factions
            const factions = await factionModel.find({guildID: interaction.guild.id});
            if (factions.length === 0) return await interaction.reply({
                content: 'There are no factions.',
                ephemeral: true
            });

            const embed = new EmbedBuilder()
                .setTitle(`${factions.length} factions found!`)
                .setDescription(factions.map(faction =>
                        `- **${faction.name}** - by <@${faction.ownerId}> `
                        + `${faction.members.length === 1 ? `(${faction.members.length} member)` : `(${faction.members.length} members)`}`
                    ).join('\n')
                )
                .setFooter({text: `Member counts are self-reported by members`, iconURL: interaction.guild.iconURL()})
                .setTimestamp()

            await interaction.reply({embeds: [embed], ephemeral: true});
        } else if (subcommand === 'about') {

            // Check if the faction exists
            const faction = await factionModel.findOne({name: data.name, guildID: interaction.guild.id});
            if (!faction) return await interaction.reply({content: 'That faction does not exist.', ephemeral: true});

            const embed = new EmbedBuilder()
                .setTitle(`${faction.name}`)
                .setDescription(
                    `**Description:** ${faction.description}`
                    + `\n**Owner:** <@${faction.ownerId}>`
                    + `\n**Members:** ${faction.members.map(member => `<@${member}>`).join(', ')}`
                )

            await interaction.reply({embeds: [embed], ephemeral: true});

        }
    }
}