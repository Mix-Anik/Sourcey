import {BaseCommand} from '../base/BaseCommand'
import {Dict} from '../base/DictionaryObject'


const attributes: Dict = new Dict({
	name: 'ping',
	argTypes: [String, Number],
	description: 'Sample command template',
	usage: 'ping',
	permissions: ['ADMIN', 'READ']
})

export const instance = new class extends BaseCommand {
	execute(message: any, args: any[]): void {
		message.reply('pong!')
	}
}(attributes)
