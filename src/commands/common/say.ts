import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions} from 'discord.js'


const attributes: Dict = new Dict({
	name: 'say',
	minArgs: 2,
	maxArgs: 2,
	description: 'Sends message in a channel from the name of the bot',
	usage: 'say <channel> "<message>"',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'COMMON',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	execute(message: Message, [mention, msg]: [string, string]): void {
		const mentionedChannels = message.mentions.channels
		if (!mentionedChannels.size) {
			message.reply(`You have to mention a channel you want message to be sent to`)
			return
		}

		mentionedChannels.first()!.send(msg)
	}
}(attributes)
