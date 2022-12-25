import {Logger} from '../utils/logging'
import {EventBase} from '../base/EventBase'
import {Dict} from '../base/Dictionary'
import {Guild} from 'discord.js'
import {GuildConfigResource} from '../resources/config'


const attributes: Dict = new Dict({
	name: 'guildDelete',
	description: 'Runs things once left a guild',
	once: false
})

export const instance = new class extends EventBase {
	async execute(guild: Guild): Promise<void> {
		const configResource = GuildConfigResource.instance()

		Logger.internalLog(`Left a guild: '${guild.name}' (${guild.id})`, true)
		await configResource.delete(guild.id)
	}
}(attributes)
