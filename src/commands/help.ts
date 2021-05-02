import {BaseCommand} from '../base/BaseCommand'
import {Dict} from '../base/DictionaryObject'
import {CommandHandler} from '../index'


const attributes = new Dict({
	name: 'help',
	argTypes: [String],
	description: 'Shows requested command documentation info',
	usage: 'help <command name>'
})

export const instance = new class extends BaseCommand {
	execute(message: any, args: any[]): void {
		const commandName = args[0]
		const command = CommandHandler.get(commandName)
		if (command) message.channel.send(command.docs())
		else message.channel.send(`Command ${args} does not exist!`)
	}
}(attributes)
