import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import Discord, {Message, Permissions} from 'discord.js'


const attributes: Dict = new Dict({
	name: 'embed',
	minArgs: 3,
	maxArgs: 4,
	description: 'Creates full embed message',
	usage: 'embed <hex color> "<title>" "<description>" <thumbnail?>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'ADMINISTRATION'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [color, title, description, thumbnail]: [string, string, string, string]): void {
		const avatar = message.author.avatarURL() ? message.author.avatarURL()! : message.author.defaultAvatarURL
		const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setTitle(title)
			.setAuthor(message.author.username, avatar)
			.setDescription(description)
			.setThumbnail(thumbnail)
			.setTimestamp()

		message.channel.send(embed)
		message.delete()
	}
}(attributes)
