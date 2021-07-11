import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Role} from 'discord.js'
import {hasRoleById} from '../../utils/helpers'


const attributes: Dict = new Dict({
	name: 'iam',
	minArgs: 1,
	maxArgs: 1,
	description: 'Assigns or removes role of your choice',
	usage: 'iam <role name>',
	permissions: [],
	module: 'MANAGEMENT'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [roleName]: [string]): void {
		const roleToAssign: Role | undefined = message.guild!.roles.cache.find(r => r.name === roleName)
		const mRoleManager = message.guild!.members.cache.get(message.member!.id)?.roles!
		let botMessage: Promise<Message>

		if (!roleToAssign) {
			botMessage = message.channel.send(`Role '${roleName}' wasn't found.`)
		} else if (!roleToAssign.mentionable) {
			botMessage = message.channel.send('This role is not self-assignable.')
		} else if (hasRoleById(message.member, roleToAssign.id)) {
			mRoleManager.remove(roleToAssign.id)
			botMessage = message.channel.send('Role **\'' + roleToAssign.name + '\'** was removed!.')
		} else if (roleToAssign && roleToAssign.mentionable) {
			mRoleManager.add(roleToAssign.id)
			botMessage = message.channel.send('Role **\'' + roleToAssign.name + '\'** granted!.')
		} else {
			botMessage = message.channel.send('Unexpected error has occurred.')
		}

		botMessage.then((msg: Message) => {
			msg.delete({timeout: 2000})
		})
	}
}(attributes)
