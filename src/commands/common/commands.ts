import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, MessageEmbed} from 'discord.js'
import {CommandHandler} from '../../app'
import {GuildConfigResource} from '../../resources/config'


const attributes = new Dict({
	name: 'commands',
	minArgs: 1,
	maxArgs: 1,
	description: 'Shows all commands for given module',
	usage: 'commands <module name>',
	permissions: [],
	module: 'COMMON'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [module]: [string]): void {
		module = module.toUpperCase()
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(message.guild.id).keyValues
		const moduleNames = Object.keys(guildConfig.Modules)
		const commands: CommandBase[] = []

		if (!moduleNames.includes(module)) {
			message.reply(`Module '${module}' does not exist`)
			return
		}

		for (const command of CommandHandler.values()) {
			if (command.module === module) commands.push(command)
		}

		if (commands.length) {
			const description = commands.map(c => `**${c.usage}**\n*${c.description}*`)
			const embed = new MessageEmbed()
				.setColor('#aaaaaa')
				.setTitle(`${module} module commands`)
				.setDescription(description)

			message.channel.send(embed)
		}
	}
}(attributes)
