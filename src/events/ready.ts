import {postgre} from '../app'
import {Logger} from '../utils/logging'
import {EventBase} from '../base/EventBase'
import {Dict} from '../base/Dictionary'
import {TwitchResource} from '../resources/twitch'
import {YoutubeResource} from '../resources/youtube'
import {VkResource} from '../resources/vk'


const attributes: Dict = new Dict({
	name: 'ready',
	description: 'Runs things once right after bot initialisation',
	once: true
})

export const instance = new class extends EventBase {
	async execute(args: any[]): Promise<void> {
		Logger.info('Bot is online!', true)
		await postgre.verify()

		// TODO: make Listeners loader
		// const twitch = TwitchResource.instance()
		// const youtube = YoutubeResource.instance()
		// const vk = VkResource.instance()
		// youtube.listen()
		// vk.listen()
		// twitch.listen()
		// connect2Chat()
	}
}(attributes)
