import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {client} from '../../app'
import {Message, MessageEmbed} from 'discord.js'
import ms from 'ms'


const attributes: Dict = new Dict({
	name: 'ping',
	minArgs: 0,
	maxArgs: 0,
	description: 'Ping bot for statistics!',
	usage: 'ping',
	permissions: [],
	module: 'MISC',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	execute(message: Message, []: []): void {
		const botPing = Date.now() - message.createdTimestamp
		const embed = new MessageEmbed()
			.setDescription(`Pong! :ping_pong:\n` +
											`**Bot:** ${botPing}ms\n` +
											`**API:** ${client.ws.ping}ms\n` +
											`**Uptime:** ${ms(client.uptime, {long: true})}`)
			.setColor('#ff0000')

		message.channel.send(embed)
	}
}(attributes)
