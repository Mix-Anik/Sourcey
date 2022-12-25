import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions} from 'discord.js'
import {hasMentions} from '../../utils/helpers'
import ms from 'ms'
import {PunishmentResource} from '../../resources/punishment'
import {PunishmentType} from '../../base/models/memberPunishment.model'


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
		const punishmentResource = PunishmentResource.instance()
		const membersToBan = Array.from(message.mentions.members!.values())
		const banTimeout = hasMentions(time, 'user') ? null : ms(time)

		for (const member of membersToBan) {
			punishmentResource.addPunishment(message.guild.id, member.id, PunishmentType.BAN, banTimeout)
		}
	}
}(attributes)
