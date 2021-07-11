import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, MessageEmbed, Permissions} from 'discord.js'
import config from '../../config.json'
import {isEmpty, sec2time} from '../../utils/helpers'
import {ServerInfoResource} from '../../resources/serverinfo'


const attributes = new Dict({
	name: 'servers',
	minArgs: 3,
	maxArgs: 4,
	description: 'Shows single or list of servers info',
	usage: 'servers <add/remove> <ip> <game> <group>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'MONITORING'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [action, fullIP, game, group]: any[]): void {
		if (action === 'add') {
			const ip = fullIP.split(':')[0]
			const port = parseInt(fullIP.split(':')[1], 10)
			const loadingMsg = new MessageEmbed()
				.setColor(config.Monitoring.server.messageColor)
				.setTitle('Loading...')

			message.channel.send(loadingMsg).then(async (newMessage: Message) => {
				setInterval(async () => {
					const embed = await this.composeEmbed(ip, port, game)

					newMessage.edit(embed)
				}, config.Monitoring.server.updateTime)
			})
		} else if (action === 'remove') {
			message.channel.send(`Not implemented`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
		} else {
			message.channel.send(`Invalid action '${action}'`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
		}
	}

	async composeEmbed(ip: string, port: number, game: string): Promise<MessageEmbed> {
		// Getting server information
		const serverInfo = ServerInfoResource.instance()
		const serverData = await serverInfo.getServerInfo(ip, port, game)

		if (serverData.status === 'online') {
			// Making up and embed with player list
			let playersText = '```\n'
			const embed = new MessageEmbed()
				.setColor(config.Monitoring.server.messageColor)
				.setTitle(serverData.serverName)
				// .setURL(`steam://connect/${serverData.serverIP}`)
				.addField('Players:',
					`${serverData.players.length}(${serverData.bots.length})/${serverData.maxplayers}`,
					true)
				.addField('Map:', serverData.serverMap, true)
			const maxNL = 15 // maximum player name length
			const maxSL = 5 // maximum player score length
			const gap = 5 // gap between player info fields
			const blank = ' '

			// Parsing players' information
			for (const player of serverData.players) {
				if (isEmpty(player)) continue

				const name = player.name.length >= maxNL ? player.name.slice(0, 11) + '...' : player.name
				const score = player.score > 9999 ? 9999 : player.score
				const time = sec2time(player.time, 0, false)
				const count1 = maxNL - name.length + gap
				const count2 = maxSL - score.toString().length + gap
				playersText += name + blank.repeat(count1) + score + blank.repeat(count2) + time + '\n'
			}

			playersText += '```'
			embed
				.addField(`steam://connect/${serverData.serverIP}`, playersText)
				.setTimestamp()
				.setFooter('', config.Monitoring.server.footerImage)

			return embed
		} else {
			return new MessageEmbed()
			.setColor(config.Monitoring.server.messageColor)
			.setTitle('Server is currently offline.')
		}
	}
}(attributes)
