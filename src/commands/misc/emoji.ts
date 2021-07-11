import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {postgre} from '../../app'
import {Message, Permissions} from 'discord.js'


const attributes: Dict = new Dict({
	name: 'emoji',
	minArgs: 2,
	maxArgs: 3,
	description: 'Nitro-Free Emojis manager',
	usage: 'emoji <add/remove> <code> <snowflake>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'MISC'
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [action, code, snowflake]: [string, string, string]): Promise<void> {
		const emojiExists = await postgre.getEmoji(code)

		if (action === 'add') {
			if (!emojiExists) {
				await postgre.addEmoji({
					code: code,
					snowflake: snowflake
				})

				message.channel.send(`Emoji :${code}: was successfully added!`).then((msg: Message) => {
					msg.delete({timeout: 2000})
				})
			} else {
				message.channel.send('Emoji with such name already exists').then((msg: Message) => {
					msg.delete({timeout: 2000})
				})
			}
		} else if (action === 'remove') {
			if (emojiExists) {
				await postgre.deleteEmoji(code)
				message.channel.send(`Emoji :${code}: was successfully deleted!`).then((msg: Message) => {
					msg.delete({timeout: 2000})
				})
			} else {
				message.channel.send('Emoji with such name does not exist').then((msg: Message) => {
					msg.delete({timeout: 2000})
				})
			}
		} else {
			message.channel.send(`Invalid action '${action}'`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
		}
	}
}(attributes)
