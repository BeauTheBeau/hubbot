const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const { fetch } = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Replies with a cat image.'),
    async execute(interaction) {

        console.log('cat')
        const url = "https://cataas.com/cat"

        const embed = new EmbedBuilder()
            .setImage(url)
        return interaction.reply({embeds: [embed]});


    }
};