// Send new articles to X channel when posted in the Forum

const {EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require("discord.js");
module.exports = {
    name: 'threadCreate',
    async execute(client, thread) {

        if (thread.parentId !== '1148380990574706852') return;

        const postData = {
            title: thread.name,
            message: await thread.fetchStarterMessage(),
            author: await client.users.fetch(thread.ownerId),
        }

        // Send "How would you rate this article?" message
        const ratingEmbed = new EmbedBuilder()
            .setTitle('Rating')
            .setDescription('How would you rate this article?'
                + `\n:green_square: Excellent | :yellow_square: Fair | :red_square: Poor`)

        const forumMessage = await thread.fetchStarterMessage();
        const reactions = ['🟩', '🟨', '🟥'];
        const ratingMessage = await forumMessage.reply({embeds: [ratingEmbed]});
        for (const reaction of reactions) await ratingMessage.react(reaction);

        // Construct .md file to send to GitHub
        // name: year-day-month-title.md

        // Md contents
        /*
            ---
            layout: post
            title: The Black League vs PK/VDV (The Great Trial)
            date: 2023-09-11
            author: FE Press | Arnav
            categories: [ "Factions" ]
            ---
         */

        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const fileName = `${year}-${month}-${day}-${postData.title.toLowerCase().split(' ').join('-')}.md`;
        const fileContents = `---`
            + `\nlayout: post`
            + `\ntitle: ${postData.title}`
            + `\ndate: ${year}-${month}-${day}`
            + `\nauthor: ${postData.author.username}, Faction Exchange Broadcasting`
            + `\ncategories: [ "Factions" ]`
            + `\n---`
            + `\n${postData.message.content}`
            + `\n`
            + `\n> ${postData.author.username},\ `
            + `\n> Faction Exchange Broadcasting\n`


        const fs = require('fs');
        const {Octokit} = require('@octokit/rest');
        fs.writeFile(`./src/articles/${fileName}`, fileContents, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });

        // Send it in the 1159202992638144522 channel
        const articleChannel = await client.channels.cache.get('1159202992638144522');
        if (!articleChannel) return;
        articleChannel.send({files: [`./src/articles/${fileName}`]});

        // Commit to GitHub
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        });

        try {
            const commitMessage = `Added article: ${postData.title}`;
            const {data: {sha}} = await octokit.repos.createOrUpdateFileContents({
                owner: 'Faction-Exchange', repo: 'news',
                path: `_posts/news/${fileName}`,
                message: commitMessage,
                content: Buffer.from(fileContents).toString('base64'),
                branch: 'master'
            });
        } catch (err) {
            console.log(err);
        } finally {
            console.log('Finished');
        }

        const channel = await client.channels.cache.get('1152282044676702230');
        if (!channel) return;

        // Send article to the Feed channel
        const slicedBody = postData.message.content.split(' ').slice(0, 32).join(' ');
        const embed = new EmbedBuilder()
            .setTitle(postData.title)
            .setDescription(`${slicedBody.length < postData.message.content.length ? `${slicedBody}...` : slicedBody} | **Read the full article here ${postData.message.url}**` +
                `\n\nor **[read it on our website](https://faction-exchange.github.io/news/factions/${year}/${month}/${day}/${fileName
                    .replace('.md', '.html')
                    .replace(`${year}-${month}-${day}-`, '')})**`)
            .setURL(postData.message.url)
            .setAuthor({
                name: postData.author.tag,
                iconURL: postData.message.author.avatarURL()
            })

        await channel.send({embeds: [embed]});

    }
}