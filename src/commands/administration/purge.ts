import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions, } from 'discord.js'
import {Logger} from '../../utils/logging'


const attributes: Dict = new Dict({
	name: 'purge',
	minArgs: 1,
	maxArgs: 5,
	description: 'Deletes last 1-100 messages in channel(s) at once',
	usage: 'purge <amount> <channels?>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'ADMINISTRATION',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [amount, ...mentions]: [any, string[]]): Promise<void> {
		if (isNaN(amount)) {
			message.reply(`'${amount}' is not a valid number`)
			return
		}

		const deleteAmount = parseInt(amount, 10)

		if (deleteAmount < 1 || deleteAmount > 100) {
			message.reply(`You can delete **100 messages at most and 1 at least**`)
			return
		}
		if (message.channel.type === 'dm') {
			message.reply(`Command can't be used in DM channel`)
			return
		}

		const channels = message.mentions.channels
		const channelsToClean = channels.size ? Array.from(channels.values()) : [message.channel]
		const author = `${message.author.username}#${message.author.discriminator}`

		await message.delete()

		for (const channel of channelsToClean) {
			channel.bulkDelete(deleteAmount, true)
				.then(msgs =>
					Logger.info(message.guild.id, `${author} bulk deleted ${msgs.size} messages in #${channel.name}`)
				).catch(res => {
					if (res.httpStatus && res.httpStatus === 400)
						message.channel.send(`Unfortunately it is not possible to delete messages older than 2 weeks`)
					else
						Logger.error(message.guild.id, `${res} (in #${channel.name})`, true)
				})
		}
	}
}(attributes)
