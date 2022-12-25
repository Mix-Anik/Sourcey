import {getRepository, Repository} from 'typeorm'
import {MemberPunishment, PunishmentType} from '../base/models/memberPunishment.model'
import {Logger} from '../utils/logging'
import {Guild, Role} from 'discord.js'
import {GuildConfigResource} from './config'
import {hasRoleById} from '../utils/helpers'
import {client} from '../app'


export class PunishmentResource {
	private static _instance: PunishmentResource | undefined
	private _repository: Repository<MemberPunishment>

	private constructor() {
		this._repository = getRepository(MemberPunishment)
	}

	public static instance(): PunishmentResource {
		if (this._instance === undefined) {
			this._instance = new PunishmentResource()
		}

		return this._instance
	}

	public async addPunishment(guildId: string, memberId: string, punishmentType: PunishmentType,
														 timeout: number = null): Promise<void> {
		const expirationDate = timeout ? new Date(Date.now() + timeout) : null
		const newPunishment = this._repository.create({
			guildId: guildId,
			memberId: memberId,
			type: punishmentType,
			expirationDate: expirationDate
		})
		await this._repository.save(newPunishment)

		switch (punishmentType) {
			case PunishmentType.BAN:
				BanService.ban(guildId, memberId)
				break
			case PunishmentType.MUTE:
				MuteService.mute(guildId, memberId)
				break
		}

		if (expirationDate) {
			this.setupTimeout(guildId, newPunishment)
			Logger.info(guildId,
				`Punished <@!${memberId}> with '${punishmentType}' for ${timeout / 1000} seconds`, true)
		}
		else Logger.info(guildId, `Punished <@!${memberId}> with '${punishmentType}' permanently`, true)
	}

	public async removePunishment(guildId: string, memberId: string, punishmentType: PunishmentType): Promise<void> {
		await this._repository.delete({
			guildId: guildId,
			memberId: memberId,
			type: punishmentType
		})

		switch (punishmentType) {
			case PunishmentType.BAN:
				BanService.unban(guildId, memberId)
				break
			case PunishmentType.MUTE:
				MuteService.unmute(guildId, memberId)
				break
		}

		Logger.info(guildId, `<@!${memberId}>'s '${punishmentType}' punishment was removed`, true)
	}

	public async setupTimeout(guildId: string, punishment: MemberPunishment): Promise<void> {
		const timeout = punishment.expirationDate.getTime() - Date.now()

		if (timeout < 0) {
			await this.removePunishment(guildId, punishment.memberId, punishment.type)
			return
		}

		setTimeout(() => {
			this.removePunishment(guildId, punishment.memberId, punishment.type)
		}, timeout)
	}

	public async setupTimeouts(guildId: string): Promise<void> {
		const allGuildPunishments = await this._repository.createQueryBuilder('MemberPunishment')
			.where('MemberPunishment.guildId = :guildId', { guildId: guildId })
			.getMany()

		for (const punishment of allGuildPunishments) {
			this.setupTimeout(guildId, punishment)
		}
	}
}

class BanService {
	static async ban(guildId: string, memberId: string): Promise<void> {
		const guild = client.guilds.cache.get(guildId)
		const member = guild.members.cache.get(memberId)

		if (member && member.bannable)
			await member.ban()
	}

	static async unban(guildId: string, memberId: string): Promise<void> {
		const guild = client.guilds.cache.get(guildId)
		const guidBans = (await guild.fetchBans()).map(m => m.user.id)

		if (guidBans.includes(memberId))
			guild.members.unban(memberId)
	}
}

class MuteService {
	static async mute(guildId: string, memberId: string): Promise<void> {
		const guild = client.guilds.cache.get(guildId)
		const member = guild.members.cache.get(memberId)
		const muteRole: Role = await this.getMuteRole(guildId)

		if (member && !hasRoleById(member, muteRole.id))
			await member.roles.add(muteRole.id)
	}

	static async unmute(guildId: string, memberId: string): Promise<void> {
		const guild = client.guilds.cache.get(guildId)
		const member = guild.members.cache.get(memberId)
		const muteRole: Role = await this.getMuteRole(guildId)

		if (member && hasRoleById(member, muteRole.id))
			await member.roles.remove(muteRole.id)
	}

	static async getMuteRole(guildId: string): Promise<Role> {
		const configResource = GuildConfigResource.instance()
		const guildConfigEntity = configResource.get(guildId)
		const guild = client.guilds.cache.get(guildId)
		let muteRole: Role | undefined = guild.roles.cache.find(
			r => r.id === guildConfigEntity.keyValues.Modules.ADMINISTRATION.muteRoleId ||
				r.name === guildConfigEntity.keyValues.Modules.ADMINISTRATION.muteRoleName
		)

		if (!muteRole) {
			Logger.info(guildId, `Mute role is unset or not found! Creating...`, true)
			muteRole = await this.createMuteRole(guild)
			guildConfigEntity.keyValues.Modules.ADMINISTRATION.muteRoleId = muteRole.id
			await configResource.update(guildId, guildConfigEntity)
		}

		return muteRole
	}

	static async createMuteRole(guild: Guild): Promise<Role> {
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(guild.id).keyValues
		const role = await guild.roles.create({
			data: {
				name: guildConfig.Modules.ADMINISTRATION.muteRoleName,
				color: '#555555',
				mentionable: false
			}
		})

		await role!.setPermissions(guildConfig.Modules.ADMINISTRATION.muteRolePermissions)

		guild.channels.cache.map(channel => channel.createOverwrite(role, {
			SEND_MESSAGES: false,
			CREATE_INSTANT_INVITE: false,
			EMBED_LINKS: false,
			ATTACH_FILES: false,
			ADD_REACTIONS: false,
			USE_EXTERNAL_EMOJIS: false,
			MENTION_EVERYONE: false,
			MANAGE_MESSAGES: false,
			READ_MESSAGE_HISTORY: false,
			SEND_TTS_MESSAGES: false,
			USE_VAD: false,
			SPEAK: false,
			STREAM: false,
			CONNECT: false,
			PRIORITY_SPEAKER: false
		}))

		return role
	}
}
