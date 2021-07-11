import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {postgre} from '../../app'
import {Message, Permissions} from 'discord.js'
import {TwitchResource} from '../../resources/twitch'


const attributes = new Dict({
	name: 'twitch',
	minArgs: 2,
	maxArgs: 2,
	description: 'Adds twitch channel to monitoring',
	usage: 'twitch <add/remove> <channel link/name>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'MONITORING'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [action, channelLink]: any[]): void {
		const channelName = channelLink.replace(/\/$/, '').substring(channelLink.lastIndexOf('/') + 1)

		if (action === 'add') {
			const twitch = TwitchResource.instance()

			twitch.getUsersByNames(channelName).then((data: any) => {
				if (data.users.length > 0) {
					const user = {
						'user_id': data.users[0]._id,
						'user_name': data.users[0].display_name,
						'stream_status': 'offline'
					}

					postgre.addTwitchUser(user)

					message.channel.send(`Twitch user '${channelName} was successfully added!`).then(msg => {
						msg.delete({timeout: 2000})
					})
				} else {
					message.channel.send('Wasn\'t able to add new twitch user.').then(msg => {
						msg.delete({timeout: 2000})
					})
				}
			})
		} else if (action === 'remove') {
			postgre.deleteTwitchUser(channelName)

			message.channel.send('Done!').then(msg => {
				msg.delete({timeout: 2000})
			})
		} else {
			message.reply('Wrong action!').then(msg => {
				msg.delete({timeout: 2000})
			})
		}
	}
}(attributes)
