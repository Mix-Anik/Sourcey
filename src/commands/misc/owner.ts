import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {client} from '../../app'
import {Message, MessageEmbed, User} from 'discord.js'
import {GuildConfigResource} from "../../resources/config";


const attributes: Dict = new Dict({
	name: 'owner',
	minArgs: 0,
	maxArgs: 0,
	description: 'Shows bot\'s owner',
	usage: 'owner',
	permissions: [],
	module: 'MISC',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	execute(message: Message, []: []): void {
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(message.guild.id).keyValues

		client.fetchApplication().then(application => {
			const owner = <User> application.owner
			const embed = new MessageEmbed()
				.setDescription(`**${owner.username}#${owner.discriminator}**`)
				.setImage(owner.avatarURL())
				.setColor(guildConfig.Modules.MISC.embedColor)

			message.channel.send(embed)
		})
	}
}(attributes)
