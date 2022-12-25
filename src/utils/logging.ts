import {TextChannel} from 'discord.js'
import {client} from '../app'
import {GuildConfigResource} from '../resources/config'
import config from '../config.json'
import {getCurrentTime} from './helpers'


export class Logger {
	static info(guildId: string, message: any, ltd: boolean = false) {
		const msg = `INFO: ${JSON.stringify(message)}`

		this.guildLog(guildId, msg, ltd)
	}

	static error(guildId: string, message: any, ltd: boolean = true) {
		const msg = `ERROR: ${JSON.stringify(message)}`

		this.guildLog(guildId, msg, ltd)
	}

	static internalLog(message: any, ltd: boolean = false) {
		const now = getCurrentTime()
		const converted = `${now} | INTERNAL: ${JSON.stringify(message)}`
		process.stderr.write(converted + '\n')

		if (ltd) this.logToDiscord(config.General.ownerGuildId, config.InternalLogger.channelId, converted)
	}

	private static guildLog(guildId: string, msg: string, ltd: boolean = false) {
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(guildId).keyValues
		const now = getCurrentTime()
		const converted = `${now} | ${msg}`
		process.stderr.write(converted + '\n')

		if (ltd) this.logToDiscord(guildId, guildConfig.Logger.channelId, converted)
	}

	static logToDiscord(guildId: string, channelId: string, message: string) {
		const guild = client.guilds.cache.get(guildId)

		if (!guild) return

		const logChannel = <TextChannel> guild.channels.cache.get(channelId)

		if (logChannel) logChannel.send(message)
	}
}
