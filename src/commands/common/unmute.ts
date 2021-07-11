import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions, Role} from 'discord.js'
import config from '../../config.json'
import {hasRoleById} from '../../utils/helpers'
import {Logger} from '../../utils/logging'


const attributes: Dict = new Dict({
	name: 'unmute',
	minArgs: 1,
	maxArgs: 10,
	description: 'Unmute specified users',
	usage: 'unmute <users>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'ADMINISTRATION',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [...mentions]: [string[]]): Promise<void> {
		const membersToUnmute = Array.from(message.mentions.members!.values())
		const usernames: string[] = []
		const muteRole: Role | undefined = message.guild!.roles.cache.find(
			r => r.id === config.Administration.MuteRoleId || r.name === config.Administration.MuteRoleName
		)

		if (!muteRole) {
			Logger.info(`Mute role is unset or not found!`, true)
			return
		}

		for (const member of membersToUnmute) {
			if (!member || !hasRoleById(member, muteRole.id)) continue
			const updatedMember = await member.roles.remove(muteRole.id)

			if (!hasRoleById(updatedMember, muteRole.id)) {
				usernames.push(`${member.user.username}#${member.user.discriminator}`)
				// TODO: remove record from db
			}
		}

		if (usernames.length) {
			const authorName = `${message.author.username}#${message.author.discriminator}`
			Logger.info(`${authorName} has unmuted: ${usernames.join(', ')}`, true)
		}
	}
}(attributes)
