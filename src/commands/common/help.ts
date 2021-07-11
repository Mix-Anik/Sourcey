import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {CommandHandler} from '../../app'
import {Message} from 'discord.js'


const attributes = new Dict({
	name: 'help',
	minArgs: 1,
	maxArgs: 1,
	description: 'Shows requested command documentation info',
	usage: 'help <command name>',
	permissions: [],
	module: 'COMMON'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [commandName]: [string]): void {
		const command = CommandHandler.get(commandName)

		if (command) message.channel.send(command.docs())
		else message.channel.send(`Unknown command '${commandName}'`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
	}
}(attributes)
