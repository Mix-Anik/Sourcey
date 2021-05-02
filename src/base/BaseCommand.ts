import {Dict} from './DictionaryObject'
import config from '../config.json'

export abstract class BaseCommand {
	public name: string
	public argTypes: any[]
	public maxArgs: number = 0
	public minArgs: number = 0
	public description: string
	public usage: string
	public permissions: string[]
	public roles: string[]
	public cooldown: number

	/**
	 * Create command
	 * @param name - name of the command
	 * @param argTypes - list of argument types
	 * @param maxArgs - maximum amount of arguments
	 * @param minArgs - minimum amount of arguments
	 * @param description - command description
	 * @param usage - command usage documentation
	 * @param permissions - list of command permissions
	 * @param roles - list of required roles the command
	 */
	constructor(commandDict: Dict) {
		this.name = commandDict.get('name')
		this.argTypes = commandDict.get('argTypes', [])
		this.description = commandDict.get('description', 'Command description is missing')
		this.usage = commandDict.get('usage', 'Command usage is missing')
		this.permissions = commandDict.get('permissions', [])
		this.roles = commandDict.get('roles', [])
		this.cooldown = commandDict.get('cooldown', 0)
	}

	/**
	 * command call handler
	 */
	public abstract execute(message: any, args: any[]): void

	public docs(): string {
		return '```\n' +
			`Command: ${config.General.prefix + this.name}\n` +
			`Usage: ${config.General.prefix + this.usage}\n` +
			`Permissions: ${this.permissions}\n` +
			`Cooldown: ${this.cooldown} seconds\n` +
			'```'
	}
}
