import {Dict} from './Dictionary'
import config from '../config.json'
import {Permissions, PermissionString} from 'discord.js'
import {hasRoleByName} from '../utils/helpers'

export abstract class CommandBase {
	/**
	 * @param name - name of the command
	 * @param maxArgs - maximum amount of arguments
	 * @param minArgs - minimum amount of arguments
	 * @param description - command description
	 * @param usage - command usage documentation
	 * @param permissions - list of command permissions
	 * @param roles - list of required roles the command
	 * @param module - module that command belongs to
	 * @param cooldown - delay between command usages
	 * @param lastCalled - timestamp of the last call
	 */
	public name: string
	public maxArgs: number
	public minArgs: number
	public description: string
	public usage: string
	public permissions: PermissionString[]
	public role: string
	public module: string
	public cooldown: number
	public lastCalled: number

	/**
	 * Create command
	 * @param commandDict - data
	 */
	constructor(commandDict: Dict) {
		this.name = commandDict.get('name', null)
		this.minArgs = commandDict.get('minArgs', 0)
		this.maxArgs = commandDict.get('maxArgs', 0)
		this.description = commandDict.get('description', 'Command description is missing')
		this.usage = commandDict.get('usage', 'Command usage is missing')
		this.permissions = commandDict.get('permissions', [])
		this.role = commandDict.get('role', null)
		this.module = commandDict.get('module', 'MISC')
		this.cooldown = commandDict.get('cooldown', 0)
		this.lastCalled = 0
	}

	/**
	 * command call handler
	 */
	public call(message: any, args: any[]): void {
		if (!message.member.hasPermission(this.permissions)) {
			message.reply(`You are not permitted to run this command.`)
			return
		}

		if (this.role && !message.member.hasPermission('ADMINISTRATOR') && !hasRoleByName(message, this.role)) {
			message.reply(`Command requires having role '${this.role}'`)
			return
		}

		if (!this.isCold()) {
			message.reply(`Command is on cooldown, try later.`)
			return
		}

		if (this.isDisabled()) {
			message.reply(`${this.module} module commands are currently disabled.`)
			return
		}

		if (args.length < this.minArgs || args.length > this.maxArgs) {
			message.reply(`Invalid amount of arguments (${args.length}), ` +
				`should be in range of (${this.minArgs}-${this.maxArgs})`)
			return
		}

		this.lastCalled = Date.now()
		this.execute(message, args)
	}

	protected abstract execute(message: any, args: any[]): void

	public isCold(): boolean {
		return this.lastCalled + (this.cooldown * 1000) < Date.now()
	}

	public isDisabled(): boolean {
		if (!config.Modules.hasOwnProperty(this.module)) return true

		return config.Modules[this.module] !== 'ON'
	}

	public docs(): string {
		const stringPermsissions = JSON.stringify(this.permissions.map(
			p => Object.keys(Permissions.FLAGS).find(key => Permissions.FLAGS[key] === p)
		))

		return '```\n' +
			`Command: ${config.General.prefix + this.name} - ${this.description}\n` +
			`Usage: ${config.General.prefix + this.usage}\n` +
			`Permissions: ${stringPermsissions}\n` +
			`Module: ${this.module}\n` +
			(this.role ? `Required Role: ${this.role}\n` : '') +
			`Cooldown: ${this.cooldown} seconds\n` +
			'```'
	}
}
