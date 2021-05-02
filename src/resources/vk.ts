// @ts-ignore
import vkapi from 'vk-easy'
import {MessageEmbed, TextChannel} from 'discord.js'
import {client, postgre} from '../index'
import config from '../config.json'


export class VkResource {
	accessToken: string

	constructor(token: string) {
		this.accessToken = token
	}

	getGroupInfo(id: string) {
		return vkapi('groups.getById', {
			group_id: id,
			v: '5.62',
			access_token: this.accessToken
		})
	}

	getUserInfo(id: string) {
		return vkapi('users.get', {
			user_id: id,
			fields: 'photo_200',
			v: '5.62',
			access_token: this.accessToken
		})
	}

	checkPosts(groupId: string, postsToCheck: number = 10, ownerOnly: boolean = true, lastId: number = -1) {
		return vkapi('wall.get', {
			owner_id: '-' + groupId,
			count: postsToCheck,
			filter: (ownerOnly ? 'owner' : 'all'),
			v: '5.62',
			access_token: this.accessToken
		}).then(async (postsData: any) => {
			const posts = postsData.response.items
			const newPosts = []
			let newLastId = lastId

			for (const post of posts) {
				const signer = (post.hasOwnProperty('signer_id') ? await this.getUserInfo(post.signer_id) : false)
				const signerName = (signer === false ? false : signer.response[0].first_name + " " + signer.response[0].last_name)
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
	updateGroup(groupId: string, newId: string) {

		const found = postgre.checkGroup(groupId)

		found.then((isFound) => {
			const data = {
				group_id: groupId,
				last_post_id: newId
			}

			if (isFound) postgre.updateGroup(data)
			else postgre.addGroup(data)
		})
	}

	// Function, which posts latest project posts from VK
	listen() {
		setInterval(async () => {
			const currentLastId = await postgre.getGroupLast(config.Monitoring.VK.groupId)

			// Getting posts we haven't posted in discord yet
			const response = await this.checkPosts(config.Monitoring.VK.groupId,
				config.Monitoring.VK.postsToCheck,
				config.Monitoring.VK.ownerOnly,
				currentLastId)

			if (response.posts.length > 0) {
				const groupData = await this.getGroupInfo(config.Monitoring.VK.groupId)
				const groupInfo = groupData.response[0]
				const posts = response.posts.reverse()

				for (const post of posts) {
					const author = (post.signer === false ? 'от ' + groupInfo.name : 'от ' + post.signer)
					const groupLink = 'https://vk.com/' + groupInfo.screen_name
					const authorPhoto = (post.signer === false ? groupInfo.photo_200 : post.signer_photo)

					// Creating discord embed message & sending it
					const embed = new MessageEmbed()
						.setColor(config.Monitoring.VK.messageColor)
						.setTitle(groupInfo.name)
						.setURL(groupLink)
						.setAuthor(author, authorPhoto, groupLink)
						.setDescription(post.message)
						.setThumbnail(groupInfo.photo_200)
						.setTimestamp()
						.setFooter(author, authorPhoto)

					const discordChannel = <TextChannel> client.channels.cache.get(config.Monitoring.VK.channelId)
					await discordChannel.send(embed)
				}

				// Changing lastID to the one we have posted last and saving it in database
				if (currentLastId < response.lastID) {
					this.updateGroup(config.Monitoring.VK.groupId, response.lastID)
				}
			}
		}, config.Monitoring.VK.updateTime)
	}
}
