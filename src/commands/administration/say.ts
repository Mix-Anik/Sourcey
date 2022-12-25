import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions} from 'discord.js'
import {isChannelMention} from '../../utils/helpers'


const attributes: Dict = new Dict({
	name: 'say',
	minArgs: 2,
	maxArgs: 2,
	description: 'Sends message in a channel from the name of the bot',
	usage: 'say <channel> "<message>"',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'ADMINISTRATION',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	execute(message: Message, [mention, msg]: [string, string]): void {
		const mentionedChannels = message.mentions.channels
		if (!mentionedChannels.size || !isChannelMention(mention)) {
			message.reply(`You have to pass a channel mention as command argument`)
			return
		}

		const channel = mentionedChannels.first()

		if (message.attachments.size)
			channel.send(msg, { files: message.attachments.array() })
		else
			channel.send(msg)
	}
}(attributes)
