// Global includes
import Discord from 'discord.js'
import 'reflect-metadata'

// Local includes
import config from './config.json'
import {Dict} from './base/Dictionary'
import {CommandBase} from './base/CommandBase'
import {getAllFiles} from './utils/helpers'
import {Logger} from './utils/logging'
import {EventBase} from './base/EventBase'


// Variables
export const client = new Discord.Client()

// Additional settings
// process.on('unhandledRejection', error => Logger.internalLog(error, true))

// Command Handler =======================================================================================
export const CommandHandler = new Dict()
const commandFiles = getAllFiles('src/commands')

for (const cf of commandFiles) {
	const command: CommandBase = require(`../${cf}`).instance

	if (command.name) CommandHandler.set(command.name, command)
	else Logger.internalLog(`Command '${cf}' doesn't have a name set`, true)
}

// Event Handlers ========================================================================================
const eventFiles = getAllFiles('src/events')

for (const ef of eventFiles) {
	const eventHandler: EventBase = require(`../${ef}`).instance

	if (!eventHandler.name) {
		Logger.internalLog(`EventHandler '${ef}' doesn't have a name set`, true)
		continue
	}

	if (eventHandler.once) client.once(eventHandler.name, eventHandler.execute)
	else client.on(eventHandler.name, eventHandler.execute)
}

client.login(config.General.token)
