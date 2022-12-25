import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions} from 'discord.js'


const attributes = new Dict({
	name: 'youtube',
	minArgs: 2,
	maxArgs: 2,
	description: 'Adds youtube channel to monitoring list',
	usage: 'youtube <add|remove> <channelId>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'MONITORING'
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [action, channelId]: [string, string]): Promise<void> {
		if (action === 'add') {
			const channel = {
				channelId: channelId,
				lastUploadDate: Date.now(),
				streamStatus: 'offline'
			}

			// await postgre.addYoutubeChannel(channel)

			message.channel.send(`Youtube channel ${channelId} was successfully added`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
		} else if (action === 'remove') {
			// await postgre.deleteYoutubeChannel(channelId)

			message.channel.send(`Youtube channel ${channelId} was successfully removed`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
		} else {
			message.channel.send(`Invalid action '${action}'`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
		}
	}
}(attributes)
