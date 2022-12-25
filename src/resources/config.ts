import {Logger} from '../utils/logging'
import {GuildConfig} from '../base/models/config.model'
import {getRepository, Repository} from 'typeorm'
import {Dict} from '../base/Dictionary'


export class GuildConfigResource {
	private static _instance: GuildConfigResource | undefined
	private _cache: Dict
	private _repository: Repository<GuildConfig>

	private constructor() {
		this._repository = getRepository(GuildConfig)
		this._cache = new Dict()
	}

	public static instance(): GuildConfigResource {
		if (this._instance === undefined) {
			this._instance = new GuildConfigResource()
		}

		return this._instance
	}

	public async updateCache(): Promise<void> {
		const allGuildConfigs = await this._repository.createQueryBuilder('GuildConfig').getMany()

		for (const guildConfig of allGuildConfigs) {
			this._cache.set(guildConfig.guildId, guildConfig)
		}
	}

	public async create(guildId: string): Promise<GuildConfig | null> {
		if (!this._cache.has(guildId)) {
			const newConfig = this._repository.create({
				guildId: guildId
			})
			await this._repository.save(newConfig)
			this._cache.set(guildId, newConfig)

			Logger.internalLog(`Created new config for guild with id '${guildId}'`)

			return newConfig
		}

		return null
	}

	public get(guildId: string): GuildConfig | null {
		if (this._cache.has(guildId)) {
			return this._cache.get(guildId)
		}

		return null
	}

	public async update(guildId: string, config: GuildConfig): Promise<boolean> {
		if (this._cache.has(guildId)) {
			await this._repository.save(config)
			this._cache.set(guildId, config)
			return true
		}

		return false
	}

	public async delete(guildId: string): Promise<void> {
		if (this._cache.has(guildId)) {
			await this._repository.delete({guildId: guildId})
			this._cache.remove(guildId)

			Logger.internalLog(`Removed config for guild with id '${guildId}'`)
		}
	}
}
