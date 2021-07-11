import axios, {AxiosRequestConfig} from 'axios'
import {MessageEmbed, TextChannel} from 'discord.js'
import {client, postgre} from '../app'
import config from '../config.json'


export class TwitchResource {
	private static _instance: TwitchResource | undefined
	private readonly clientId: string

	private constructor() {
		this.clientId = config.Monitoring.twitch.clientId
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
	public listen() {
		setInterval(async () => {
			const twitchUsers: any = await postgre.getTwitchUsers()

			for (const user of twitchUsers) {
				const streamInfo: any = await this.getStreamInfo(user.user_id)
				const streamStatus = streamInfo.stream == null ? 'offline' : 'online'

				if (streamStatus !== user.stream_status) {
					if (streamStatus === 'online') {
						const embed = new MessageEmbed()
							.setColor(config.Monitoring.twitch.messageColor)
							.setTitle(streamInfo.stream.channel.url)
							.setURL(streamInfo.stream.channel.url)
							.setAuthor(streamInfo.stream.channel.display_name + ' is now streaming!', config.Monitoring.twitch.authorImage, streamInfo.stream.channel.url)
							.addField('Description:', streamInfo.stream.channel.status)
							.addField('Playing:', streamInfo.stream.game, true)
							.addField('Viewers:', streamInfo.stream.viewers, true)
							.addField('Language:', streamInfo.stream.channel.language, true)
							.setThumbnail(streamInfo.stream.channel.logo)
							.setImage(streamInfo.stream.preview.large)
							.setTimestamp()
							.setFooter(config.Monitoring.twitch.footerText, config.Monitoring.twitch.footerImage)

						const discordChannel = <TextChannel> client.channels.cache.get(config.Monitoring.twitch.channelId)
						await discordChannel.send(embed)
					}

					await postgre.updateTwitchStreamStatus({user_id: user.user_id, stream_status: streamStatus})
				}
			}
		}, config.Monitoring.twitch.updateTime)
	}
}
