import {query as queryServer, QueryResult} from 'gamedig'
import {IGuildConfig} from '../base/interfaces/guildConfig'
import {MessageEmbed, TextChannel} from 'discord.js'
import {clamp, isEmpty, truncate} from '../utils/helpers'
import {getRepository, Repository} from 'typeorm'
import {ServersReporter} from '../base/models/serversReporter.model'
import {client} from '../app'
import {GuildConfigResource} from './config'
import {Logger} from '../utils/logging'
import {Server} from '../base/models/server.model'
import {DiscordMessage} from '../base/models/discordMessage.model'
import ms from 'ms'
import {Dict} from '../base/Dictionary'


export class ServersReporterResource {
  private static _instance: ServersReporterResource | undefined
	private _cache: Dict
	private serversReporterRepository: Repository<ServersReporter>
	private serverRepository: Repository<Server>

	private constructor() {
		this.serversReporterRepository = getRepository(ServersReporter)
		this.serverRepository = getRepository(Server)
		this._cache = new Dict()
	}

	public static instance() {
		if (this._instance === undefined)
			this._instance = new ServersReporterResource()

		return this._instance
	}

  /**
   * Fetches server's information
   * @param {string} ip - server host ip address
   * @param {string} port - server host port
   * @param {string} game - game short code (default: css)
   * full list of games can be found at "https://github.com/sonicsnes/node-gamedig"
   * @returns {Promise<any>} object with information about game server
   */
  public getServerInfo(ip: string, port: number, game: string ='css'): Promise<any> {
    return new Promise(resolve => {
      const queryData: any = {
        type: game,
        host: ip,
        port: port
      }

      queryServer(queryData).then((data: QueryResult) => {
        resolve({
          status: 'online',
          serverName: data.name,
          serverIP: data.connect,
          serverMap: data.map,
          maxplayers: data.maxplayers,
          players: data.players,
          bots: data.bots
        })
      }).catch(() => {
        resolve({
          status: 'offline'
        })
      })
    })
  }

  public async updateCache(reporters: ServersReporter[] = []): Promise<void> {
		const allServerReporters = !!reporters.length ? reporters : await this.serversReporterRepository.find({
			relations: ['message', 'servers']
		})

		for (const reporter of allServerReporters) {
			if (!this._cache.has(reporter.guildId)) {
				this._cache.set(reporter.guildId, new Dict())
			}

			this._cache.get(reporter.guildId).set(reporter.id, reporter)
		}
	}

  public async create(guildId: string, channelId: string, title: string,
											authorImageURL: string = null): Promise<ServersReporter> {
  	const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(guildId).keyValues
  	const guild = client.guilds.cache.get(guildId)
		const channel = <TextChannel> guild.channels.cache.get(channelId)
		const embed = new MessageEmbed()
			.setColor(guildConfig.Modules.MONITORING.embedColor)
			.setAuthor(title, authorImageURL)
			.setTimestamp()
		const reporterMessage = await channel.send(embed)
		const newReporter = this.serversReporterRepository.create({
			guildId: guildId,
			message: {
				guildId: guildId,
				channelId: channelId,
				messageId: reporterMessage.id
			},
			title: title,
			authorImageURL: authorImageURL
		})

		await this.serversReporterRepository.save(newReporter).catch((e) => {
			Logger.error(guildId, `Failed to create ServiceReporter: ${e}`, true)
		})

		await this.updateCache([newReporter])
		this.setupInterval(guildId, newReporter.id)

		return newReporter
	}

	public async delete(guildId: string, messageId: string, channelId: string): Promise<void> {
		const reporter = await this.serversReporterRepository
			.createQueryBuilder('reporter')
			.innerJoin(DiscordMessage, 'message', 'message.id = reporter.message_id')
			.where('reporter.guildId = :guildId', {guildId: guildId})
			.andWhere('message.guildId = :guildId', {guildId: guildId})
			.andWhere('message.channelId = :channelId', {channelId: channelId})
			.andWhere('message.messageId = :messageId', {messageId: messageId})
			.getOne()

		console.log(reporter.servers)

		const removedReporter = await reporter.remove()

		const guild = client.guilds.cache.get(guildId)
		const channel = <TextChannel> guild.channels.cache.get(channelId)
		await channel.messages.delete(messageId)
			.catch(() => Logger.info(guildId, `Removed ServersReporter(${reporter.title}) due to message being deleted`, true))
	}

	public async addServer(guildId: string, channelId: string, messageId: string, ip: string, port: number, game: string): Promise<boolean> {
		const reporter = await this.serversReporterRepository
			.createQueryBuilder('reporter')
			.innerJoin(DiscordMessage, 'message', 'message.id = reporter.message_id')
			.where('reporter.guildId = :guildId', {guildId: guildId})
			.andWhere('message.guildId = :guildId', {guildId: guildId})
			.andWhere('message.channelId = :channelId', {channelId: channelId})
			.andWhere('message.messageId = :messageId', {messageId: messageId})
			.getOne()

		if (reporter) {
			const server = await this.serverRepository.create({
				guildId: guildId,
				ip: ip,
				port: port,
				game: game,
				serversReporter: reporter
			}).save()
			const cachedReporter = this._cache.get(guildId).get(reporter.id)
			cachedReporter.servers.push(server)

			return true
		}

		return false
	}

	public async removeServer(guildId: string, channelId: string, messageId: string, ip: string, port: number, game: string): Promise<boolean>
	{
		const server = await this.serverRepository
			.createQueryBuilder('server')
			.innerJoinAndSelect('server.serversReporter', 'reporter', 'reporter.id = server.servers_reporter_id')
			.innerJoin(DiscordMessage, 'message', 'message.id = reporter.message_id')
			.where('server.guildId = :guildId', {guildId: guildId})
			.andWhere('server.ip = :ip', {ip: ip})
			.andWhere('server.port = :port', {port: port})
			.andWhere('server.game = :game', {game: game})
			.andWhere('message.channelId = :channelId', {channelId: channelId})
			.andWhere('message.messageId = :messageId', {messageId: messageId})
			.getOne()

		if (server) {
			const cachedReporter = this._cache.get(guildId).get(server.serversReporter.id)
			cachedReporter.servers = cachedReporter.servers.filter((s: Server) => s.id !== server.id)
			server.remove()

			return true
		}

		return false
	}

	private async createEmbedMessage(guildConfig: IGuildConfig, reporter: ServersReporter): Promise<MessageEmbed> {
  	const embed = new MessageEmbed()
		const servers = reporter.servers

		if (servers && !!servers.length) {
			embed
				.setColor(guildConfig.Modules.MONITORING.embedColor)
				.setAuthor(reporter.title, reporter.authorImageURL)
				.setTimestamp()

			for (const server of servers) {
				const serverData = await this.getServerInfo(server.ip, server.port, server.game)

				if (serverData.status === 'online') {
					embed
					.addField(`**${serverData.serverName}**`,
										`${serverData.serverMap} | ` +
										`${serverData.players.length}(${serverData.bots.length})/${serverData.maxplayers} | ` +
										`steam://connect/${serverData.serverIP}\n` +
										`${ServersReporterResource.formatPlayerList(serverData)}`)
				} else {
					embed
					.addField(`**${server.ip}:${server.port}**`,
										`Server is currently offline`)
				}
			}
		} else {
			embed
					.setColor(guildConfig.Modules.MONITORING.embedColor)
					.setTitle('No servers to show')
		}

		return embed
	}

	private static formatPlayerList(serverData: any, limit: number = 10): string {
  	if (!serverData.players.length) {
  		return '`Server is empty`'
		}

  	let playersText = ''
		const maxNL = 15 // maximum player name length
		const maxSL = 6 // maximum player score length
		const gap = 6 // gap between player info fields
		const blank = ' '

		// Parsing players' information
		for (const player of serverData.players.slice(0, limit)) {
			if (isEmpty(player)) continue

			const name = truncate(player.name, maxNL)
			const score = clamp(player.score, -9999, 9999)
			const time = ms(player.time * 1000)
			const gap1 = blank.repeat(maxNL - name.length + gap)
			const gap2 = blank.repeat(maxSL - score.toString().length + gap)
			playersText += `\`${name}${gap1}${score}${gap2}${time}\`\n`
		}

		return playersText
	}

  public async setupInterval(guildId: string, reporterId: number): Promise<void> {
  	const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(guildId).keyValues
		const guild = client.guilds.cache.get(guildId)
		const reporter = this._cache.get(guildId).get(reporterId)
		const channel = <TextChannel> guild.channels.cache.get(reporter.message.channelId)

  	const interval = setInterval(async () => {
			const message = await channel.messages.fetch(reporter.message.messageId).catch(() => { return undefined })

			if (!message) {
				this.delete(guildId, reporter.message.messageId, reporter.message.channelId)
				clearInterval(interval)
			} else {
				const embed = await this.createEmbedMessage(guildConfig, reporter)
				message.edit(embed)
			}
		}, guildConfig.Modules.MONITORING.servers.updateTime)
	}

	public async setupIntervals(): Promise<void> {
  	for (const guildReporters of this._cache.values()) {
			for (const reporter of guildReporters.values()) {
				this.setupInterval(reporter.guildId, reporter.id)
			}
		}
	}
}
