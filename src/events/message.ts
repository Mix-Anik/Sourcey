import {CommandHandler, postgre} from '../app'
import {EventBase} from '../base/EventBase'
import {Dict} from '../base/Dictionary'
import {Message, TextChannel} from 'discord.js'
import config from '../config.json'
import {CommandBase} from '../base/CommandBase'
import {hasEmoji, hasRoleById} from '../utils/helpers'
import {WebhookResource} from '../resources/webhook'


const attributes: Dict = new Dict({
	name: 'message',
	description: 'Logic to perform upon receiving a message',
	once: false
})

export const instance = new class extends EventBase {
	async execute(message: Message): Promise<void> {
		if (!message.member || message.member.user.bot) return

		if (message.content.startsWith(config.General.prefix)) {
			const regex = /"([^"]*)"|(\S+)/g
			const allArgs = message.content.slice(config.General.prefix.length).trim()
			const cmdArgs = (allArgs.match(regex) || []).map(m => m.replace(regex, '$1$2'))
			const cmdName = cmdArgs.shift()!.toLowerCase()
			const command: CommandBase = CommandHandler.get(cmdName)

			if (!command) {
				message.reply(`Could not find command '${cmdName}'.`)
				return
			}

			command.call(message, cmdArgs)
		}

		// TODO: remake as a listener
		// Resends message with custom emojis
		else if (
			message.channel.type === 'text' &&
			hasRoleById(message.member, config.Misc.Emoji.roleId) &&
			hasEmoji(message.content)) {

			let modifiedMessage = message.content
			let response = message.content
			const emojiRegex = /<a?:[a-zA-Z0-9_]+:[0-9]+>/g
			const codeRegex = /:[a-zA-Z0-9_]+:/g

			modifiedMessage.match(emojiRegex)?.forEach((msg: string) => {
				modifiedMessage = modifiedMessage.replace(msg, '')
			})

			modifiedMessage.match(codeRegex)?.forEach(async (msg: string) => {
				const emojiCode = msg.substring(1, msg.length - 1)
				const customEmoji = await postgre.getEmoji(emojiCode)
				const webhook = await WebhookResource.instance(<TextChannel> message.channel)
				const avatar = message.author.avatarURL() ? message.author.avatarURL()! : message.author.defaultAvatarURL
				response = response.replace(msg, customEmoji)

				await webhook.edit({
					channel: message.channel.id
				})
				await message.delete()

				webhook.send(response, {
					username: message.member!.displayName,
					avatarURL: avatar
				})
			})
		}
	}
}(attributes)
