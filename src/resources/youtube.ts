import axios from 'axios'
import {client, postgre} from '../app'
import {TextChannel} from 'discord.js'
import config from '../config.json'
import {Logger} from '../utils/logging'


export class YoutubeResource {
	private static _instance: YoutubeResource | undefined
	private apikey: string

	private constructor() {
		this.apikey = config.Monitoring.youtube.apikey
	}

	public static instance() {
		if (this._instance === undefined)
			this._instance = new YoutubeResource()

		return this._instance
	}

	public async getChannelVideos(channelId: string, afterDate: string): Promise<any> {
		const dateFilter = new Date(parseInt(afterDate, 10)).toISOString()

		return axios({
			method: 'GET',
			url: `https://www.googleapis.com/youtube/v3/search`,
			params: {
				part: 'snippet',
				maxResults: 5,
				channelId: channelId,
				type: 'video',
				order: 'date',
				publishedAfter: dateFilter,
				key: this.apikey
			}
		}).then(res => {
			return res.data.items
		}).catch(err => Logger.error(`Failed fetching youtube: ${err}`, true))
	}

	public listen(): void {
		setInterval(async () => {
			const channels = await postgre.getYoutubeChannels()

			for (const channel of channels) {
				const videos = (await this.getChannelVideos(channel.id, channel.lastUploadDate))
					.filter(v => new Date(v.snippet.publishedAt).getTime() > channel.lastUploadDate)

				if (videos.length) {
					const discordChannel = <TextChannel> client.channels.cache.get(config.Monitoring.youtube.channelId)
					const orderedVideos = videos.reverse()
					const lastUpload = orderedVideos[orderedVideos.length - 1]
					const newLastUploadDate = new Date(lastUpload.snippet.publishedAt).getTime()

					orderedVideos.forEach(video => {
					  discordChannel.send(`https://www.youtube.com/watch?v=${video.id.videoId}`)
					})

					await postgre.updateYoutubeLUD({
						channelId: channel.id,
						lastUploadDate: newLastUploadDate
					})
				}
			}
		}, config.Monitoring.youtube.updateTime)
	}
}
