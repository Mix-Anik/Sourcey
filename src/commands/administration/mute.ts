import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions} from 'discord.js'
import {hasMentions} from '../../utils/helpers'
import ms from 'ms'
import {PunishmentResource} from '../../resources/punishment'
import {PunishmentType} from '../../base/models/memberPunishment.model'


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
		const punishmentResource = PunishmentResource.instance()
		const membersToMute = Array.from(message.mentions.members!.values())
		const muteTimeout = hasMentions(time, 'user') ? null : ms(time)

		for (const member of membersToMute) {
			punishmentResource.addPunishment(message.guild.id, member.id, PunishmentType.MUTE, muteTimeout)
		}
	}
}(attributes)
