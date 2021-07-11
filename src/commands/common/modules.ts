import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, MessageEmbed} from 'discord.js'
import config from '../../config.json'


const attributes = new Dict({
	name: 'modules',
	minArgs: 0,
	maxArgs: 0,
	description: 'Shows modules and enabled state',
	usage: 'modules',
	permissions: [],
	module: 'COMMON'
})

export const instance = new class extends CommandBase {
	execute(message: Message, []: []): void {
		const moduleNames = Object.keys(config.Modules)

		if (moduleNames.length) {
			const description = moduleNames.map(mn => `**${mn}** ${config.Modules[mn] === 'ON' ? '✅' : '❌'}`)
			const embed = new MessageEmbed()
				.setColor('#aaaaaa')
				.setDescription(description)

			message.channel.send(embed)
		}
	}
}(attributes)
