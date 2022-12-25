import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions} from 'discord.js'
import {Emoji} from '../../base/models/emoji.model'
import {getRepository} from 'typeorm'


const attributes: Dict = new Dict({
	name: 'emoji',
	minArgs: 2,
	maxArgs: 3,
	description: 'Nitro-Free Emojis manager',
	usage: 'emoji <add|remove> <code> <snowflake>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'MISC'
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [action, code, snowflake]: [string, string, string]): Promise<void> {
		const emojiRepository = getRepository(Emoji)
		const existingEmoji = await emojiRepository.findOne({code: code})

		if (action === 'add') {
			if (!existingEmoji) {
				const newEmoji = emojiRepository.create({
					guildId: message.guild.id,
					code: code,
					snowflake: snowflake
				})
				await newEmoji.save()

				message.channel.send(`Emoji :${code}: was successfully added!`).then((msg: Message) => {
					msg.delete({timeout: 2000})
				})
			} else {
				message.channel.send('Emoji with such name already exists').then((msg: Message) => {
					msg.delete({timeout: 2000})
				})
			}
		} else if (action === 'remove') {
			if (existingEmoji) {
				await emojiRepository.remove(existingEmoji)

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
