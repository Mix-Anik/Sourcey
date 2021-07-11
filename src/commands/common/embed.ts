import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import Discord, {Message, Permissions} from 'discord.js'
import config from '../../config.json'


const attributes: Dict = new Dict({
	name: 'embed',
	minArgs: 3,
	maxArgs: 4,
	description: 'Creates embed message (full or minimal)',
	usage: 'embed <full/simple> <title> <description> <thumbnail?>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'MISC'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [type, title, description, thumbnail]: [string, string, string, string]): void {
		const embed = new Discord.MessageEmbed()
			.setColor(config.Misc.Embeds.messageColor)

		if (type === 'full') {
			const avatar = message.author.avatarURL() ? message.author.avatarURL()! : message.author.defaultAvatarURL

			embed
			.setTitle(title)
			.setAuthor(message.author.username, avatar)
			.setDescription(description)
			.setThumbnail(thumbnail)
			.setTimestamp()
			.setFooter(config.Misc.Embeds.footerText, config.Misc.Embeds.footerImage)

			message.channel.send(embed)
			message.delete()
		} else if (type === 'simple') {
			embed
				.setTitle(title)
				.setDescription(description)

			message.channel.send(embed)
			message.delete()
		} else {
			message.channel.send(`Invalid type '${type}'`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
		}
	}
}(attributes)
