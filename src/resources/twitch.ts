import req from 'request'
import {MessageEmbed, TextChannel} from 'discord.js'
import {client, postgre} from '../index'
import config from '../config.json'


export class TwitchResource {
	clientId: string

	constructor(clientId: string) {
		this.clientId = clientId
	}

	getUsersByNames(names: string) {
		const options = {
			url: 'https://api.twitch.tv/kraken/users?login=' + names,
			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
				'Client-ID': this.clientId
			}
		}

		return new Promise((resolve, reject) => {
			req(options, (error, response, body) => {
				if (error) reject(error)
				else resolve(JSON.parse(body))
			})
		})
	}

	getChannelById(channelId: string) {
		const options = {
			url: 'https://api.twitch.tv/kraken/channels/' + channelId,
			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
				'Client-ID': this.clientId
			}
		}

		return new Promise((resolve, reject) => {
			req(options, (error, response, body) => {
				if (error) reject(error)
				else resolve(JSON.parse(body))
			})
		})
	}

	getStreamInfo(channelId: string) {
		const options = {
			url: 'https://api.twitch.tv/kraken/streams/' + channelId,
			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
				'Client-ID': this.clientId
			}
		}

		return new Promise((resolve, reject) => {
			req(options, (error, response, body) => {
				if (error) reject(error)
				else resolve(JSON.parse(body))
			})
		})
	}

	// Checks for twitch users being streaming
	listen() {
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
							.setAuthor(streamInfo.stream.channel.display_name + " is now streaming!", config.Monitoring.twitch.authorImage, streamInfo.stream.channel.url)
							.addField("Description:", streamInfo.stream.channel.status)
							.addField("Playing:", streamInfo.stream.game, true)
							.addField("Viewers:", streamInfo.stream.viewers, true)
							.addField("Language:", streamInfo.stream.channel.language, true)
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
