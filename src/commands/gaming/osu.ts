import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, MessageEmbed} from 'discord.js'
import {OsuResource} from '../../resources/osu'
import {GuildConfigResource} from '../../resources/config'


const attributes = new Dict({
	name: 'osu',
	minArgs: 1,
	maxArgs: 1,
	description: 'Shows osu player statistics by nickname',
	usage: 'osu <player name>',
	permissions: [],
	module: 'GAMING'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [playerName]: [string]): void {
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(message.guild.id).keyValues
		const osu = OsuResource.instance()

		osu.getPlayerStats(playerName).then(data => {
			const embed = new MessageEmbed()
				.setColor(guildConfig.Modules.MISC.embedColor)
			if (!data) {
				embed
					.setAuthor('Could not retrieve data, try later!')
			} else {
				embed
					.setAuthor(playerName + '\'s Profile', data.profileImage, data.profileLink)
					.addField('**Register Date:**', data.regDate, true)
					.addField('**Country:**', ':flag_' + data.userData.country.toLowerCase() + ':', true)
					.addField('**Playtime:**', data.playtime, true)
					.addField(':yellow_circle:**SS/**:white_circle:**SS(HD)**', data.userData.counts.SS + '/' + data.userData.counts.SSH, true)
					.addField(':yellow_circle:**S/**:white_circle:**S(HD)**', data.userData.counts.S + '/' + data.userData.counts.SH, true)
					.addField(':green_circle:**A**', data.userData.counts.A, true)
					.addField('**Best score overall:**', data.bestScore, false)
					.addField('**Most recent score:**', data.recentScore, false)
					.setImage(data.statsImage)
					.setFooter('Footer image was made using https://lemmmy.pw/osusig')
			}

			message.channel.send(embed)
		})
	}
}(attributes)
