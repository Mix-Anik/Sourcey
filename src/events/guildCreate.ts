import {Logger} from '../utils/logging'
import {EventBase} from '../base/EventBase'
import {Dict} from '../base/Dictionary'
import {Guild} from 'discord.js'
import {GuildConfigResource} from '../resources/config'


const attributes: Dict = new Dict({
	name: 'guildCreate',
	description: 'Runs things once joined a new guild',
	once: false
})

export const instance = new class extends EventBase {
	async execute(guild: Guild): Promise<void> {
		const configResource = GuildConfigResource.instance()

		Logger.internalLog(`Joined a new guild: '${guild.name}' (${guild.id})`, true)
		await configResource.create(guild.id)
	}
}(attributes)
