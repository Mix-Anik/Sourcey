import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {client} from '../../app'
import {Message, MessageEmbed} from 'discord.js'
import {GuildConfigResource} from "../../resources/config";


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
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(message.guild.id).keyValues

		const embed = new MessageEmbed()
			.setDescription('Pinging...')
			.setColor(guildConfig.Modules.MISC.embedColor)
		message.channel.send(embed).then(msg => {
			const botPing = msg.createdTimestamp - message.createdTimestamp
			embed
				.setDescription(`:ping_pong: Pong :ping_pong:\n` +
												`**Bot:** ${botPing}ms\n` +
												`**API:** ${client.ws.ping}ms`)

			msg.edit(embed)
		})
	}
}(attributes)
