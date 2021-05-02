import axios from 'axios'
import {client, postgre} from '../index'
import {TextChannel} from 'discord.js'
import config from '../config.json'


export class YoutubeResource {
	private apikey: string

	constructor(apikey: string) {
		this.apikey = apikey
	}

	async getChannelVideos(channelId: string, afterDate: string): Promise<any> {
		const dateFilter = new Date(parseInt(afterDate, 10)).toISOString()
		// const response = axios({
		//     method: 'GET',
		//     url: `https://www.googleapis.com/youtube/v3/search`,
		//     params: {
		//       part: 'snippet',
		//       maxResults : 5,
		//       channelId: channelId,
		//       type: 'video',
		//       order: 'date',
		//       publishedAfter: dateFilter,
		//       key: this.apikey
		//     }
		// })
		const data = {
			browseId: "UCyEAWx-xBlI-uP2RkqaG43A",
			params: "EgZ2aWRlb3M%3D"
		}
		const response = axios({
			method: 'POST',
			url: 'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
			data: data
		})
		console.log(response)

		response.then((res: any) => {
			console.log(res)
		})

		return [] // response.data.items
	}

	listen(): void {
		setInterval(async () => {
			const channels = await postgre.getYoutubeChannels()

			for (const channel of channels) {
				const videos = await this.getChannelVideos(channel.id, channel.lastUploadDate)

				if (videos.length) {
					const discordChannel = <TextChannel> client.channels.cache.get(config.Monitoring.youtube.channelId)
					const orderedVideos = videos.reverse()
					const lastUpload = orderedVideos[orderedVideos.length - 1]
					const newLastUploadDate = new Date(lastUpload.snippet.publishedAt).getDate()

					// orderedVideos.forEach(video => {
					//   discordChannel.send(`https://www.youtube.com/watch?v=${video.id.videoId}`)
					// })

					await postgre.updateYoutubeLUD({
						channelId: channel.id,
						lastUploadDate: newLastUploadDate
					})
				}
			}
		}, config.Monitoring.youtube.updateTime)
	}
}
