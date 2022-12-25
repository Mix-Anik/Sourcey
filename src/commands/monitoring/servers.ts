import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {Message, Permissions, TextChannel} from 'discord.js'
import {isChannelMention} from '../../utils/helpers'
import {ServersReporterResource} from '../../resources/serversReporter'
import {ServersReporter} from '../../base/models/serversReporter.model'


const attributes = new Dict({
	name: 'servers',
	minArgs: 2,
	maxArgs: 5,
	description: 'Shows info about list of servers or single server',
	usage: '\nservers create <channel> "<title>" <icon url?>' +
				 '\nservers <add/remove> <channel> <msg id> <full ip> <game>' +
				 '\nservers delete <channel> <msg id>',
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	module: 'MONITORING'
})

export const instance = new class extends CommandBase {
	async execute(message: Message, [action, mention, ...args]: any[]): Promise<void> {
		const mentionedChannels = message.mentions.channels

		if (!mentionedChannels.size || !isChannelMention(mention)) {
			message.reply(`You have to pass a channel mention as command argument`)
			return
		}

		const channel = mentionedChannels.first()

		if (action === 'create') {
			const reporter = await this.actionCreate(message.guild.id, mentionedChannels.first(), args)
			message.channel.send(`Created new ServersReporter(${reporter.message.messageId}) in <#${channel.id}>`)
		} else if (action === 'delete') {
			await this.actionDelete(message.guild.id, channel, args)
			message.channel.send(`Removed ServersReporter(${args[0]}) from <#${channel.id}>`)
		} else if (action === 'add') {
			const added = await this.actionAdd(message.guild.id, mentionedChannels.first(), args)

			if (added) message.channel.send(`Added ${args[2]} server ${args[1]} to ServersReporter(${args[0]}) in <#${channel.id}>`)
			else message.channel.send(`ServersReporter does not exist!`)
		} else if (action === 'remove') {
			const removed = await this.actionRemove(message.guild.id, mentionedChannels.first(), args)

			if (removed) message.channel.send(`Removed ${args[2]} server ${args[2]} from ServersReporter(${args[0]}) in <#${channel.id}>`)
			else message.channel.send(`ServersReporter does not have such server!`)
		} else {
			message.channel.send(`Invalid action '${action}'`).then((msg: Message) => {
				msg.delete({timeout: 2000})
			})
		}
	}

	actionCreate(guildId: string, channel: TextChannel, [title, iconUrl]: any[]): Promise<ServersReporter> {
		const serversReporterResource = ServersReporterResource.instance()

		return serversReporterResource.create(guildId, channel.id, title, iconUrl)
	}

	actionDelete(guildId: string, channel: TextChannel, [messageId]: any[]): Promise<void> {
		const serversReporterResource = ServersReporterResource.instance()

		return serversReporterResource.delete(guildId, messageId, channel.id)
	}

	actionAdd(guildId: string, channel: TextChannel, [messageId, fullIp, game]: any[]): Promise<boolean> {
		const serversReporterResource = ServersReporterResource.instance()
		const ip = fullIp.split(':')[0]
		const port = parseInt(fullIp.split(':')[1], 10)

		return serversReporterResource.addServer(guildId, channel.id, messageId, ip, port, game)
	}

	actionRemove(guildId: string, channel: TextChannel, [messageId, fullIp, game]: any[]): Promise<boolean> {
		const serversReporterResource = ServersReporterResource.instance()
		const ip = fullIp.split(':')[0]
		const port = parseInt(fullIp.split(':')[1], 10)

		return serversReporterResource.removeServer(guildId, channel.id, messageId, ip, port, game)
	}
}(attributes)
