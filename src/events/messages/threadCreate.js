// Send new articles to X channel when posted in the Forum

const {EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require("discord.js");
module.exports = {
    name: 'threadCreate',
    async execute(client, thread) {

        if (thread.parentId !== '1148380990574706852') return;

        const postData = {
            title: thread.name,
            message: await thread.fetchStarterMessage(),
            author: await client.users.fetch(thread.ownerId)
        }

        const channel = await client.channels.cache.get('1152282044676702230');
        if (!channel) return;

        // Send article to the Feed channel
        const body = postData.message.content.split(' ').slice(0, 32).join(' ');
        const embed = new EmbedBuilder()
            .setTitle(postData.title)
            .setDescription(`${body.length < postData.message.content.length ? `${body}...` : body} | **Read the full article here ${postData.message.url}**`)
            .setURL(postData.message.url)
            .setAuthor({
                name: postData.author.tag,
                iconURL: postData.message.author.avatarURL()
            })

        // await channel.send({ embeds: [embed] });

        // Send "Rate this article message" in the thread
        const ratingRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`excellent-${postData.message.id}`)
                    .setLabel('Excellent')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🟩'),
                new ButtonBuilder()
                    .setCustomId(`fair-${postData.message.id}`)
                    .setLabel('Fair')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🟨'),
                new ButtonBuilder()
                    .setCustomId(`poor-${postData.message.id}`)
                    .setLabel('Poor')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🟥')
            )

        await thread.send({ content: `How would you rate this article?`, components: [ratingRow] });



    }
}