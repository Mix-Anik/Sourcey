// Global includes
import Discord from 'discord.js'

// Local includes
import config from './config.json'
import {PostgreManager} from './models/db'
import {Dict} from './base/Dictionary'
import {CommandBase} from './base/CommandBase'
import {getAllFiles} from './utils/helpers'
import {Logger} from './utils/logging'
import {EventBase} from './base/EventBase'


// Variables
export const client = new Discord.Client()
export const postgre = new PostgreManager(
	config.General.database.host,
	config.General.database.port,
	config.General.database.name,
	config.General.database.user,
	config.General.database.pass)

// Command Handler =======================================================================================
export const CommandHandler = new Dict()
const commandFiles = getAllFiles('src/commands')

for (const cf of commandFiles) {
	const command: CommandBase = require(`../${cf}`).instance

	if (command.name) CommandHandler.set(command.name, command)
	else Logger.error(`Command '${cf}' doesn't have a name set`, true)
}

// Event Handlers ========================================================================================
const eventFiles = getAllFiles('src/events')

for (const ef of eventFiles) {
	const eventHandler: EventBase = require(`../${ef}`).instance

	if (!eventHandler.name) {
		Logger.error(`EventHandler '${ef}' doesn't have a name set`, true)
		continue
	}

	if (eventHandler.once) client.once(eventHandler.name, eventHandler.execute)
	else client.on(eventHandler.name, eventHandler.execute)
}

client.login(config.General.token)
