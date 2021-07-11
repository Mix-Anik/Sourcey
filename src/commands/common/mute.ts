import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Guild, GuildMember, Message, Permissions, Role} from 'discord.js'
import {hasMentions, hasRoleById} from '../../utils/helpers'
import {Logger} from '../../utils/logging'
import ms from 'ms'
import config from '../../config.json'


const attributes: Dict = new Dict({
	name: 'mute',
	minArgs: 1,
	maxArgs: 10,
	description: 'Mute specified users from chatting/speaking',
	usage: 'mute <time?> <users>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'ADMINISTRATION',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [time, ...mentions]: [string, string[]]): Promise<void> {
		const membersToMute = Array.from(message.mentions.members!.values())
		const muteTimeout = hasMentions(time, 'user') ? null : ms(time)
		const mutedMembers: GuildMember[] = []
		const usernames: string[] = []
		let muteRole: Role | undefined = message.guild!.roles.cache.find(
			r => r.id === config.Administration.MuteRoleId || r.name === config.Administration.MuteRoleName
		)

		if (!muteRole) {
			Logger.info(`Mute role is unset or not found! Creating...`, true)
			muteRole = await this.createMuteRole(message.guild!)
			config.Administration.MuteRoleId = muteRole.id
		}

		for (const member of membersToMute) {
			if (!member || hasRoleById(member, muteRole.id)) continue
			const updatedMember = await member.roles.add(muteRole.id)

			if (hasRoleById(updatedMember, muteRole.id)) {
				usernames.push(`${member.user.username}#${member.user.discriminator}`)
				mutedMembers.push(updatedMember)
			}
		}

		if (usernames.length) {
			const authorName = `${message.author.username}#${message.author.discriminator}`
			Logger.info(`${authorName} has muted: ${usernames.join(', ')}`, true)
		}

		if (muteTimeout && mutedMembers.length) this.unmuteAfter(message.guild!, mutedMembers, muteTimeout)
	}

	async createMuteRole(guild: Guild): Promise<Role> {
		const role = await guild.roles.create({
			data: {
				name: config.Administration.MuteRoleName,
				color: '#555555',
				mentionable: false
			}
		})

		await role!.setPermissions(config.Administration.MuteRolePermissions)

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

	unmuteAfter(guild: Guild, members: GuildMember[], time: number): void {
		setTimeout(async () => {
			const usernames: string[] = []
			const muteRole: Role | undefined = guild.roles.cache.find(
				r => r.id === config.Administration.MuteRoleId || r.name === config.Administration.MuteRoleName
			)

			if (!muteRole) {
				const memberUsernames = members.map(m => `${m.user.username}#${m.user.discriminator}`).join(', ')
				Logger.error(`Mute role is unset or not found! Can't unmute: ${memberUsernames}`, true)
				return
			}

			for (const member of members) {
				if (!member || !hasRoleById(member, muteRole.id)) continue
				const updatedMember = await member.roles.remove(muteRole.id)
				// TODO: remove record from db

				if (!hasRoleById(updatedMember, muteRole.id))
					usernames.push(`${updatedMember.user.username}#${updatedMember.user.discriminator}`)
			}

			if (usernames.length) Logger.info(`A mute for: ${usernames.join(', ')} has expired!`, true)
		}, time)
	}
}(attributes)
