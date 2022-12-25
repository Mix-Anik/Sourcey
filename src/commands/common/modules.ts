import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, MessageEmbed} from 'discord.js'
import {GuildConfigResource} from '../../resources/config'
import {CommandModule} from '../../base/interfaces/command'


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
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(message.guild.id).keyValues
		const moduleNames = Object.keys(guildConfig.Modules)

		if (moduleNames.length) {
			const description = moduleNames.map(
				(mn: CommandModule) => `**${mn}** ${guildConfig.Modules[mn].enabled ? '✅' : '❌'}`
			)
			const embed = new MessageEmbed()
				.setColor(guildConfig.Modules.COMMON.embedColor)
				.setDescription(description)

			message.channel.send(embed)
		}
	}
}(attributes)
