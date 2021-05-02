import {BaseCommand} from '../base/BaseCommand'
import {Dict} from '../base/DictionaryObject'
import {osu} from '../index'
import {MessageEmbed} from 'discord.js'
import config from '../config.json'


const attributes = new Dict({
	name: 'osu',
	argTypes: [String],
	description: 'Shows osu player statistics by nickname',
	usage: 'osu <player name>'
})

export const instance = new class extends BaseCommand {
	execute(message: any, args: any[]): void {
		const playerName = args[0]

		osu.getPlayerStats(playerName).then(data => {
			const embed = new MessageEmbed()
			if (!data) {
				embed
					.setColor(config.Misc.Osu.messageColor)
					.setAuthor('Could not retrieve data, try later!')
			} else {
				embed
					.setColor(config.Misc.Osu.messageColor)
					.setAuthor(playerName + "'s Profile", data.profileImage, data.profileLink)
					.addField("**Register Date:**", data.regDate, true)
					.addField("**Country:**", ":flag_" + data.userData.country.toLowerCase() + ":", true)
					.addField("**Playtime:**", data.playtime, true)
					.addField(":yellow_circle:**SS/**:white_circle:**SS(HD)**", data.userData.counts.SS + "/" + data.userData.counts.SSH, true)
					.addField(":yellow_circle:**S/**:white_circle:**S(HD)**", data.userData.counts.S + "/" + data.userData.counts.SH, true)
					.addField(":green_circle:**A**", data.userData.counts.A, true)
					.addField("**Best score overall:**", data.bestScore, false)
					.addField("**Most recent score:**", data.recentScore, false)
					.setImage(data.statsImage)
					.setFooter("Footer image was made using https://lemmmy.pw/osusig")
			}

			message.channel.send(embed)
		})
	}
}(attributes)
