import {Logger} from '../utils/logging'
import {EventBase} from '../base/EventBase'
import {Dict} from '../base/Dictionary'
import {TwitchResource} from '../resources/twitch'
import {YoutubeResource} from '../resources/youtube'
import {VkResource} from '../resources/vk'
import {establishDatabaseConnection} from '../utils/db'
import {GuildConfigResource} from '../resources/config'
import {PunishmentResource} from '../resources/punishment'
import {ServersReporterResource} from '../resources/serversReporter'
import {client} from '../app'

// TODO: fix resources, make use of models
// TODO: create Mute model & use it


const attributes: Dict = new Dict({
	name: 'ready',
	description: 'Runs things once right after bot initialisation',
	once: true
})

export const instance = new class extends EventBase {
	async execute(args: any[]): Promise<void> {
		await establishDatabaseConnection()

		const configResource = GuildConfigResource.instance()
		const punishmentResource = PunishmentResource.instance()
		const serversReporterResource = ServersReporterResource.instance()

		await configResource.updateCache()
		await serversReporterResource.updateCache()
		serversReporterResource.setupIntervals()

		for (const guild of client.guilds.cache.array()) {
			punishmentResource.setupTimeouts(guild.id)
		}
		Logger.internalLog(`Punishment timeouts loaded`, true)
		Logger.internalLog(`ServersReporters loaded`, true)

		// TODO: make Listeners loader
		// const twitch = TwitchResource.instance()
		// const youtube = YoutubeResource.instance()
		// const vk = VkResource.instance()
		// youtube.listen()
		// vk.listen()
		// twitch.listen()
		// connect2Chat()

		Logger.internalLog('Bot is ready!', true)
	}
}(attributes)
