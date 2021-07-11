import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Guild, GuildMember, Message, Permissions} from 'discord.js'
import {Logger} from '../../utils/logging'
import {hasMentions} from '../../utils/helpers'
import ms from 'ms'


const attributes: Dict = new Dict({
	name: 'ban',
	minArgs: 1,
	maxArgs: 10,
	description: 'Ban specified users from guild',
	usage: 'ban <time?> <users>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'ADMINISTRATION',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [time, ...mentions]: [string, string[]]): Promise<void> {
		const membersToBan = Array.from(message.mentions.members!.values())
		const banTimeout = hasMentions(time, 'user') ? null : ms(time)
		const bannedMembers: string[] = []

		for (const member of membersToBan) {
			if (!member.bannable) {
				Logger.info(`Unable to ban user: ${member.user.username}`, true)
				continue
			}

			await member.ban()
			bannedMembers.push(`${member.user.username}#${member.user.discriminator}`)
		}

		if (bannedMembers.length) {
			const authorName = `${message.author.username}#${message.author.discriminator}`
			Logger.info(`${authorName} has banned: ${bannedMembers.join(', ')}`, true)
		}

		if (banTimeout) this.unbanAfter(message.guild!, membersToBan, banTimeout)
	}

	unbanAfter(guild: Guild, members: GuildMember[], time: number): void {
		setTimeout(async () => {
			const usernames: string[] = []
			const guidBans = (await guild.fetchBans()).map(m => m.user.id)

			members.map(m => {
				if (guidBans.includes(m.id)) {
					guild.members.unban(m.id)
					usernames.push(`${m.user.username}#${m.user.discriminator}`)
				}
			})

			if (usernames.length) Logger.info(`A ban for: ${usernames.join(', ')} has expired!`, true)
		}, time)
	}
}(attributes)
