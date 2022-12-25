import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import {client} from '../../app'
import {Message, MessageEmbed} from 'discord.js'
import ms from 'ms'
import {getRepository, getManager} from 'typeorm'
import {GuildConfig} from '../../base/models/config.model'
import ormconfig from '../../ormconfig'
import * as os from 'os'
import {GuildConfigResource} from "../../resources/config";


const attributes: Dict = new Dict({
	name: 'status',
	minArgs: 0,
	maxArgs: 0,
	description: 'Shows bot statistics!',
	usage: 'status',
	permissions: [],
	module: 'MISC',
	cooldown: 5
})

export const instance = new class extends CommandBase {
	execute(message: Message, []: []): void {
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(message.guild.id).keyValues
		const configRepository = getRepository(GuildConfig)
		const dbSizeQuery = getManager().query(`select pg_size_pretty(pg_database_size(\'${ormconfig.database}\'));`)
		const guildsCountQuery = configRepository.count()

		Promise.all([dbSizeQuery, guildsCountQuery]).then(([dbSize, guildsCount]) => {
			const memUsage = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
			const freeMem = Math.round((os.freemem() / 1024 / 1024) * 100) / 100
			const embed = new MessageEmbed()
				.setDescription(`Bot Statistics:\n` +
												`**Uptime:** ${ms(client.uptime!, {long: true})}\n` +
												`**Guilds:** ${guildsCount}\n` +
												`**DB Size:** ${dbSize[0].pg_size_pretty}\n` +
												`**Free Mem:** ${freeMem} MB\n` +
												`**Mem Usage:** ${memUsage} MB`)
				.setColor(guildConfig.Modules.MISC.embedColor)

			message.channel.send(embed)
		})
	}
}(attributes)
