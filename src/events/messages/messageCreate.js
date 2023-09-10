const userModel = require('../../models/userModel.js');

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

    }
}