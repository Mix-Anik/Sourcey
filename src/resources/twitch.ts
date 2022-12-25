import axios, {AxiosRequestConfig} from 'axios'
import {MessageEmbed, TextChannel} from 'discord.js'
import {client} from '../app'
import config from '../config.json'
import {GuildConfigResource} from './config'


export class TwitchResource {
	private static _instance: TwitchResource | undefined
	private readonly clientId: string

	private constructor() {
		this.clientId = config.Resources.twitch.clientId
	}

	public static instance() {
		if (this._instance === undefined)
			this._instance = new TwitchResource()

		return this._instance
	}

	public getUsersByNames(names: string) {
		const options: AxiosRequestConfig = {
			method: 'GET',
			url: 'https://api.twitch.tv/kraken/users',
			params: {
				login: names
			},
			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
				'Client-ID': this.clientId
			}
		}

		return new Promise((resolve, reject) => {
			axios(options)
				.then(res => resolve(res.data))
				.catch(err => reject(err))
		})
	}

	public getChannelById(channelId: string) {
		const options: AxiosRequestConfig = {
			method: 'GET',
			url: `https://api.twitch.tv/kraken/channels/${channelId}`,
			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
				'Client-ID': this.clientId
			}
		}

		return new Promise((resolve, reject) => {
			axios(options)
				.then(res => resolve(res.data))
				.catch(err => reject(err))
		})
	}

	public getStreamInfo(channelId: string) {
		const options: AxiosRequestConfig = {
			url: `https://api.twitch.tv/kraken/streams/${channelId}`,
			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
				'Client-ID': this.clientId
			}
		}

		return new Promise((resolve, reject) => {
			axios(options)
				.then(res => resolve(res.data))
				.catch(err => reject(err))
		})
	}

	// Checks for twitch users being streaming
	public listen(guildId: string) {
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(guildId).keyValues

		setInterval(async () => {
			const twitchUsers: any = null// await postgre.getTwitchUsers()

			for (const user of twitchUsers) {
				const streamInfo: any = await this.getStreamInfo(user.user_id)
				const streamStatus = streamInfo.stream == null ? 'offline' : 'online'

				if (streamStatus !== user.stream_status) {
					if (streamStatus === 'online') {
						const embed = new MessageEmbed()
							.setColor(guildConfig.Modules.MONITORING.embedColor)
							.setTitle(streamInfo.stream.channel.url)
							.setURL(streamInfo.stream.channel.url)
							// TODO: get twitch user avatar link
							.setAuthor(streamInfo.stream.channel.display_name + ' is now streaming!',
								'', streamInfo.stream.channel.url)
							.addField('Description:', streamInfo.stream.channel.status)
							.addField('Playing:', streamInfo.stream.game, true)
							.addField('Viewers:', streamInfo.stream.viewers, true)
							.addField('Language:', streamInfo.stream.channel.language, true)
							.setThumbnail(streamInfo.stream.channel.logo)
							.setImage(streamInfo.stream.preview.large)
							.setTimestamp()

						const discordChannel = <TextChannel> client.channels.cache.get(guildConfig.Modules.MONITORING.twitch.channelId)
						await discordChannel.send(embed)
					}

					// await postgre.updateTwitchStreamStatus({user_id: user.user_id, stream_status: streamStatus})
				}
			}
		}, guildConfig.Modules.MONITORING.twitch.updateTime)
	}
}
