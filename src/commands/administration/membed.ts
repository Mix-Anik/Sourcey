import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import Discord, {Message, Permissions} from 'discord.js'


const attributes: Dict = new Dict({
	name: 'membed',
	minArgs: 2,
	maxArgs: 2,
	description: 'Creates minimal embed message',
	usage: 'membed <hex color> "<description>"',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'ADMINISTRATION'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [color, description]: [string, string]): void {
		const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setDescription(description)

			message.channel.send(embed)
			message.delete()
	}
}(attributes)
