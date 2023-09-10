const userModel = require('../../models/userModel.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(client, member) {

        const user = await userModel.findOne({userID: member.id});
        if (!user) {
            const newUser = new userModel({
                userID: member.id,
                guildID: member.guild.id,
                lastUpdated: Date.now()
            });
            await newUser.save();
        }

        // Give them role 1148621384075972678
        const role = member.guild.roles.cache.get('1148621384075972678');
        member.roles.add(role);

    }
}