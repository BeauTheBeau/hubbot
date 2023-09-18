const userModel = require('../../models/userModel.js');
const {EmbedBuilder} = require("discord.js");

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {

        const user = await userModel.findOne({userID: message.author.id});
        if (!user) {
            const newUser = new userModel({
                userID: message.author.id,
                guildID: message.guild.id,
                lastUpdated: Date.now()
            });
            await newUser.save();
        }

        if (message.author.id === "756591292057911446") {

            console.log(message.content);

            // Send message in channel with ID 1153431596171526245
            const channel = await client.channels.cache.get('1153434368543559700');
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setURL(message.url)
                .setTitle('Big Lebron Quotations')
                .setDescription(message.content)
                .setThumbnail(message.author.avatarURL())

            const sentMessage = await channel.send({embeds: [embed]});

            // react with epic, positive emoji
            await sentMessage.react('🤩');
            await sentMessage.react('👍');
            await sentMessage.react('👌');
            await sentMessage.react('👏');
            await sentMessage.react('🙌');
            await sentMessage.react('👑');
            await sentMessage.react('🐐');

        }

    }
}