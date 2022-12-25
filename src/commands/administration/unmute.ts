import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions, Role} from 'discord.js'
import {PunishmentResource} from '../../resources/punishment'
import {PunishmentType} from '../../base/models/memberPunishment.model'


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
		const punishmentResource = PunishmentResource.instance()
		const membersToUnmute = Array.from(message.mentions.members.values())

		for (const member of membersToUnmute) {
			punishmentResource.removePunishment(message.guild.id, member.id, PunishmentType.MUTE)
		}
	}
}(attributes)
