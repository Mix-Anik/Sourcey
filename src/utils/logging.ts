import config from '../config.json'
import {TextChannel} from 'discord.js'
import {client} from '../app'


export class Logger {
	static info(message: any, ltd: boolean = false) {
		const converted = `INFO: ${JSON.stringify(message)}`
		process.stdout.write(converted + '\n')

		if (ltd) this.logToDiscord(converted)
	}

	static error(message: any, ltd: boolean = false) {
		const converted = `ERROR: ${JSON.stringify(message)}`
		process.stderr.write(converted + '\n')

		if (ltd) this.logToDiscord(converted)
	}

	static logToDiscord(message: string) {
		const logsChannel = <TextChannel> client.channels.cache.get(config.Logger.channelId)

		if (logsChannel) logsChannel.send(message)
	}
}
