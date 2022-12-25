// @ts-ignore
import vkapi from 'vk-easy'
import {MessageEmbed, TextChannel} from 'discord.js'
import {client} from '../app'
import config from '../config.json'
import {GuildConfigResource} from "./config";


export class VkResource {
	private static _instance: VkResource | undefined
	private readonly accessToken: string

	private constructor() {
		this.accessToken = config.Resources.vk.accessToken
	}

	public static instance() {
		if (this._instance === undefined)
			this._instance = new VkResource()

		return this._instance
	}

	public getGroupInfo(id: string) {
		return vkapi('groups.getById', {
			group_id: id,
			v: '5.62',
			access_token: this.accessToken
		})
	}

	public getUserInfo(id: string) {
		return vkapi('users.get', {
			user_id: id,
			fields: 'photo_200',
			v: '5.62',
			access_token: this.accessToken
		})
	}

	public checkPosts(groupId: string, postsToCheck: number = 10, ownerOnly: boolean = true, lastId: number = -1) {
		return vkapi('wall.get', {
			owner_id: '-' + groupId,
			count: postsToCheck,
			filter: (ownerOnly ? 'owner' : 'all'),
			v: '5.62',
			access_token: this.accessToken
		}).then(async (postsData: any) => {
			const posts = postsData.response.items
			const newPosts: any = []
			let newLastId = lastId

			for (const post of posts) {
				const signer = (post.hasOwnProperty('signer_id') ? await this.getUserInfo(post.signer_id) : false)
				const signerName = (signer === false ? false : signer.response[0].first_name + ' ' + signer.response[0].last_name)
				const signerPhoto = (signer === false ? false : signer.response[0].photo_200)

				if (lastId < post.id) {

					const postData = {
						id: post.id,
						date: post.date,
						message: post.text,
						signer: signerName,
						signer_photo: signerPhoto
					}

					newPosts.push(postData)
					if (newLastId < post.id) newLastId = post.id
				}
			}

			return {
				posts: newPosts,
				lastID: newLastId
			}
		})
	}

	// Updates VK group's last post ids in database
	public updateGroup(groupId: string, newId: string) {

		// const found = postgre.checkGroup(groupId)
		//
		// found.then((isFound) => {
		// 	const data = {
		// 		group_id: groupId,
		// 		last_post_id: newId
		// 	}
		//
		// 	if (isFound) postgre.updateGroup(data)
		// 	else postgre.addGroup(data)
		// })
	}

	// Function, which posts latest project posts from VK
	public listen(guildId: string) {
		const configResource = GuildConfigResource.instance()
		const guildConfig = configResource.get(guildId).keyValues

		setInterval(async () => {
			const currentLastId = 12345// await postgre.getGroupLast(config.Monitoring.VK.groupId)

			// Getting posts we haven't posted in discord yet
			const response = await this.checkPosts(guildConfig.Modules.MONITORING.vk.groupId,
				guildConfig.Modules.MONITORING.vk.postsToCheck,
				guildConfig.Modules.MONITORING.vk.ownerOnly,
				currentLastId)

			if (response.posts.length > 0) {
				const groupData = await this.getGroupInfo(guildConfig.Modules.MONITORING.vk.groupId)
				const groupInfo = groupData.response[0]
				const posts = response.posts.reverse()

				for (const post of posts) {
					const author = (post.signer === false ? 'от ' + groupInfo.name : 'от ' + post.signer)
					const groupLink = 'https://vk.com/' + groupInfo.screen_name
					const authorPhoto = (post.signer === false ? groupInfo.photo_200 : post.signer_photo)

					// Creating discord embed message & sending it
					const embed = new MessageEmbed()
						.setColor(guildConfig.Modules.MONITORING.embedColor)
						.setTitle(groupInfo.name)
						.setURL(groupLink)
						.setAuthor(author, authorPhoto, groupLink)
						.setDescription(post.message)
						.setThumbnail(groupInfo.photo_200)
						.setTimestamp()
						.setFooter(author, authorPhoto)

					const discordChannel = <TextChannel> client.channels.cache.get(guildConfig.Modules.MONITORING.vk.channelId)
					await discordChannel.send(embed)
				}

				// Changing lastID to the one we have posted last and saving it in database
				if (currentLastId < response.lastID) {
					this.updateGroup(guildConfig.Modules.MONITORING.vk.groupId, response.lastID)
				}
			}
		}, guildConfig.Modules.MONITORING.vk.updateTime)
	}
}
