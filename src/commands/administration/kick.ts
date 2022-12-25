import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions} from 'discord.js'
import {Logger} from '../../utils/logging'


const attributes: Dict = new Dict({
	name: 'kick',
	minArgs: 1,
	maxArgs: 10,
	description: 'Kick specified users from guild',
	usage: 'kick <users>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'ADMINISTRATION',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [...mentions]: [string[]]): Promise<void> {
		const membersToKick = Array.from(message.mentions.members!.values())
		const kickedMembers: string[] = []

		for (const member of membersToKick) {
			if (!member.kickable) {
				Logger.info(message.guild.id, `Unable to kick user: ${member.user.username}`, true)
				continue
			}

			await member.kick()
			kickedMembers.push(`${member.user.username}#${member.user.discriminator}`)
		}

		if (kickedMembers.length) {
			const authorName = `${message.author.username}#${message.author.discriminator}`
			Logger.info(message.guild.id,`${authorName} has kicked: ${kickedMembers.join(', ')}`, true)
		}
	}
}(attributes)
