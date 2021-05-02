// Global includes
import Discord from 'discord.js'
import req from 'request'
import fs from 'fs'
import net from 'net'

// Local includes
import config from './config.json'
import {VkResource} from './resources/vk'
import {TwitchResource} from './resources/twitch'
import {YoutubeResource} from './resources/youtube'
import {OsuResource} from './resources/osu'
import {ServerInfoResource} from './resources/serverinfo'
import {PostgreManager} from './models/db'
import {RoleManager} from './base/RoleManager'
import {RoleManagerRole} from './base/RoleManagerRole'
import {Dict} from './base/DictionaryObject'
import {P, M} from './base/Flags'

// Variables
export const client = new Discord.Client()
const sockets = new net.Socket()
export const postgre = new PostgreManager(
	config.General.database.host,
	config.General.database.port,
	config.General.database.name,
	config.General.database.user,
	config.General.database.pass)
const serverInfo = new ServerInfoResource()
const twitch = new TwitchResource(config.Monitoring.twitch.clientId)
export const youtube = new YoutubeResource(config.Monitoring.youtube.apikey)
const vk = new VkResource(config.Monitoring.VK.accessToken)
export const osu = new OsuResource(config.Misc.Osu.apikey)
// const emojihook = new Discord.WebhookClient(config.Misc.Emoji.webhookId, config.Misc.Emoji.webhookToken)
let emojihook: any = null


// HELPER FUNCTIONS & OTHER
// Converts date seconds into human understandabe format
export function sec2time(timeInSeconds: number, fixed: number = 3, ms: boolean = true) {
	const pad = (num: number, size: number): string => {
		return ('000' + num).slice(size * -1)
	}
	const rounded = +(Math.round(Number(timeInSeconds + `e+${String(fixed)}`)) + `e-${String(fixed)}`)
	const hours = Math.floor(timeInSeconds / 3600)
	const minutes = Math.floor(timeInSeconds / 60) % 60
	const seconds = Math.floor(timeInSeconds - (hours * 3600 + minutes * 60))
	const milliseconds = `${rounded}`.split('.')[1]

	let formatedTime = pad(hours, 2) + ':' +
		pad(minutes, 2) + ':' +
		pad(seconds, 2) +
		(ms && milliseconds ? '.' + milliseconds : '')
	formatedTime = formatedTime.replace("00:", "")

	return formatedTime
}

// Checks if object is empty
export function isEmpty(obj: object) {
	for (const prop in obj) {
		if (obj.hasOwnProperty(prop)) return false
	}
	return true
}

// Checks whether member has role or not
export function hasRole(member: Discord.GuildMember, roleId: string) {
	return member.roles.cache.has(roleId)
}

// Connects and handles C2D events
export function connect2Chat() {
	if (!M.MONITORING) return

	sockets.connect(config.Monitoring.c2d.socketPort, config.Monitoring.c2d.serverIp,  () => {
		console.log('Connected to socket at ' + config.Monitoring.c2d.serverIp + ":" + config.Monitoring.c2d.socketPort)
	})

	sockets.on('data', (data) => {
		const msgData = data.toString().split("|")
		const player = msgData[0]
		const msg = msgData[1]
		const secret = msgData[2]

		if (secret === config.Monitoring.c2d.secret) {
			const embed = new Discord.MessageEmbed()
				.setColor(config.Monitoring.c2d.color)
				.setDescription("**" + player + " : **" + msg.slice(1, msg.length - 1))

			const discordChannel = <Discord.TextChannel> client.channels.cache.get(config.Monitoring.c2d.channelId)
			discordChannel.send(embed)
		}
	})

	sockets.on('close', () => {
		console.log('Connection closed with socket at ' + config.Monitoring.c2d.serverIp + ":" + config.Monitoring.c2d.socketPort)
	})

	sockets.on('error', (err) => {
		console.log("[Sockets Error]:", err)
	})
}

// Checks if command message is in valid format
export function isValid(msg: Discord.Message) {
	if (msg.content.includes("  ")) {
		msg.channel.send("Message has too many spaces!")
		return false
	}
	return true
}

// Returns mention id
export function parseMention(mention: string): string {
	const matchesMention = mention.match(/<(@!?|#)(\d+)>/)
	if (matchesMention) return matchesMention[2] // returning second group element (0-input, 1-first group, 2-second group)
	else return mention // returning mention itself as it is just an id
}

// Returns emoji unicode
export function parseEmoji(emoji: string) {
	const uEmoji = escape(emoji)
	if (uEmoji === emoji) return undefined
	return uEmoji
}

// Checks if message contains any emoji representation calls
export function hasEmoji(message: string) {
	const regExp = /:[a-zA-Z0-9_]+:/
	return regExp.test(message)
}

// Checks if discord member has Nitro
export function hasNitro(member: Discord.GuildMember) {
	// req({
	//   headers: {
	//     'Content-Type': 'application/json',
	//     'Authorization': config.General.token
	//   },
	//   uri: `https://discord.com/api/v8/users/${member.id}/profile`,
	//   method: 'GET'
	// }, function (err, res, body) {
	//   if (err) console.log('Wasn\'t able to get profile info.')
	//   else console.log(body)
	// })

	return !!member
}

// Command Handler Setup =======================================================================================

// Retrieves all files located in given directory
function getAllFiles(directory: string): string[] {
	let files: string[] = []

	fs.readdirSync(directory).filter(file => {
		const fullPath = directory + "/" + file

		if (file.endsWith('.ts')) {
			files.push(fullPath)
		} else if (fs.statSync(fullPath).isDirectory()) {
			files = files.concat(getAllFiles(fullPath))
		}
	})

	return files
}

// getting & setting up commands
export const CommandHandler = new Dict()
const commandFiles = getAllFiles('src/commands')

for (const cf of commandFiles) {
	const command = require(`../${cf}`).instance
	CommandHandler.set(command.name, command)
}

// =============================================================================================================
client.once('ready', async () => {
	console.log('Ready!')
	const mainGuild: Discord.Guild = <Discord.Guild> client.guilds.cache.get(config.General.guildId)
	const webhooks = await mainGuild.fetchWebhooks()
	emojihook = webhooks.get(config.Misc.Emoji.webhookId)
	await postgre.verify()
	// youtube.listen()
	// vk.listen()
	// twitch.listen()
	// connect2Chat()
})


client.on('message', async message => {
	if (!message.member || message.member.user.bot) return

	const isAdmin = message.member.hasPermission(P.ADMINISTRATOR)

	if (message.content.startsWith(config.General.prefix)) {
		const cmdArgs = message.content.slice(config.General.prefix.length).trim().split(/ +/)
		const cmdName = cmdArgs.shift()!.toLowerCase()
		const command: any = CommandHandler.get(cmdName)

		if (command) command.execute(message, cmdArgs)
	}

	// DISPLAYS SERVER STATUS (map, players, ip)
	if (message.content.startsWith(config.General.prefix + "info") && M.MONITORING && isAdmin) {

		const msg = message.content.split(' ')
		let ip = config.Monitoring.server.serverIp
		let port = config.Monitoring.server.serverPort
		let tn = config.Monitoring.server.thumbImage

		switch (msg.length) {
			case 2:
				ip = msg[1].split(':')[0]
				port = msg[1].split(':')[1]
				tn = config.Monitoring.server.thumbImage
				break

			case 3:
				ip = msg[1].split(':')[0]
				port = msg[1].split(':')[1]
				tn = msg[2]
				break
		}


		message.channel.send("Loading...").then(async (newMessage) => {

			setInterval(async () => {
				const serverData = serverInfo.getServerInfo(ip, port)

				serverData.then((data) => {

					if (data.status === 'online') {
						// Getting server information
						const serverName = data.serverName
						const serverMap = data.serverMap
						const serverIP = data.serverIP
						const maxplayers = data.maxplayers
						const players = data.players
						const bots = data.bots

						let playersText = "```\n"

						const embed = new Discord.MessageEmbed()
							.setColor(config.Monitoring.server.messageColor)
							.setTitle(serverName)
							.setURL(config.Monitoring.server.projectWebsite)
							.setAuthor(config.Monitoring.server.messageAuthor, config.Monitoring.server.authorImage, config.Monitoring.server.projectWebsite)
							.setDescription(serverIP)
							.setThumbnail(tn)
							.addField('Онлайн:', `${players.length}(${bots.length})/${maxplayers}`, true)
							.addField('Карта:', serverMap, true)


						const maxNL = 15 // maximum player name length
						const maxSL = 5 // maximum player score length
						const gap = 5 // gap between player info fields
						const blank = " "

						// Parsing players' information
						for (const player of players) {
							if (isEmpty(player)) continue

							const name = player.name.length >= maxNL ? player.name.slice(0, 11) + "..." : player.name
							const score = player.score > 9999 ? 9999 : player.score
							const time = sec2time(player.time, 0, false)
							const count1 = maxNL - name.length + gap
							const count2 = maxSL - score.toString().length + gap
							playersText += name + blank.repeat(count1) + score + blank.repeat(count2) + time + "\n"
						}

						playersText += "```"
						embed
							.addField('Игроки:', playersText)
							// .setImage('attachment://logo.png')
							.setTimestamp()
							.setFooter(config.Monitoring.server.footerText, config.Monitoring.server.footerImage)

						newMessage.edit(embed)
					} else {
						newMessage.edit('Server is currently offline.')
					}
				})
			}, config.Monitoring.server.updateTime)
		})
	}


	// Embeding discord user messages (full embed)
	else if (message.content.startsWith(config.General.prefix + "embed") && M.MISC && isAdmin) {
		const author = message.author
		const msgLines = message.content.split('\n')
		const params = msgLines[0].split('|')
		const description = msgLines.slice(1, msgLines.length).join('\n')

		const embed = new Discord.MessageEmbed()
			.setColor(config.Misc.Embeds.messageColor)
			.setTitle(params[1])
			.setAuthor(author.username, <string> author.avatarURL())
			.setDescription(description)
			.setThumbnail(params[2])
			.setTimestamp()
			.setFooter(config.Misc.Embeds.footerText, config.Misc.Embeds.footerImage)

		message.channel.send(embed)
		message.delete()
	}


	// Embeding discord user messages (only wrapp)
	else if (message.content.startsWith(config.General.prefix + "sembed") && M.MISC && isAdmin) {

		const msgLines = message.content.split('\n')
		const params = msgLines[0].split('|')
		const description = msgLines.slice(1, msgLines.length).join('\n')

		const embed = new Discord.MessageEmbed()
			.setColor(config.Misc.Embeds.messageColor)
			.setTitle(params[1])
			.setDescription(description)
		// .setFooter(config.Misc.Embeds.footerText, config.Misc.Embeds.footerImage)

		message.channel.send(embed)
		message.delete()
	}


	// Adds self-assignable roles to user
	else if (message.content.startsWith(config.General.prefix + "iam") && M.ROLES) {
		const roleName = message.content.split(" ")[1]
		const roleToAssign: any = message.guild!.roles.cache.find(r => r.name === roleName)
		const mRoleManager = <Discord.GuildMemberRoleManager> message.guild!.members.cache.get(message.member.id)?.roles

		if (!roleToAssign) {
			message.channel.send("Такой роли не существует.").then(msg => {
				msg.delete({timeout: 2000})
			})
		} else if (!roleToAssign.mentionable) {
			message.channel.send("Данная роль не является самоназначаемой.").then(msg => {
				msg.delete({timeout: 2000})
			})
		} else if (hasRole(message.member, roleToAssign.id)) {
			mRoleManager.remove(roleToAssign.id)
			message.channel.send("Роль **'" + roleToAssign.name + "'** убрана.").then(msg => {
				msg.delete({timeout: 2000})
			})
		} else if (roleToAssign && roleToAssign.mentionable) {
			mRoleManager.add(roleToAssign.id)
			message.channel.send("Роль **'" + roleToAssign.name + "'** получена.").then(msg => {
				msg.delete({timeout: 2000})
			})
		}
		message.delete()
	}


	// Reconnects to C2D server
	else if (message.content === (config.General.prefix + "reconnect") && M.MONITORING && isAdmin) connect2Chat()


	// Sends messages to game (C2D)
	else if (message.member.id !== client.user!.id && M.MONITORING && message.channel.id === config.Monitoring.c2d.channelId) {
		const msgData = message.author.username + "|" + message.content + "|" + config.Monitoring.c2d.secret

		sockets.write(msgData)
	}


	// Adds role manager to the discord chat
	else if (message.content.startsWith(config.General.prefix + "rolemanager") && M.ROLES && isAdmin) {
		if (!isValid(message)) return

		const params = message.content.split("\n")
		const action = params[1]
		const channel = <Discord.TextChannel> message.guild!.channels.cache.get(parseMention(params[2]))

		if (action === "create") {
			const title = params[3]
			// TODO: steal Discord.Client.resolver.resolveColor function
			const color = 0 // CDR.resolveColor(params[4])

			// Check if all necessary information is given and has right format
			if (channel === undefined ||
				title === undefined ||
				isNaN(color)) {
				message.channel.send("Incorrect or missing information")
				return
			}

			const data = {
				guild: message.guild,
				channel: channel,
				title: title,
				color: color
			}

			const rm = new RoleManager(data)
			// Creating RM object (sending it in discord chat) and storing message id
			rm.create().then(rmObj => {
				// Saving rm into db
				postgre.addRM(rmObj)
			})
		} else if (action === "add") {
			const msgId = parseMention(params[2])
			const roleId = parseMention(params[3])
			const emoji = parseEmoji(params[4])
			const description = params[5]

			if (channel === undefined ||
				msgId === undefined ||
				roleId === undefined ||
				emoji === undefined ||
				description === undefined) {
				message.channel.send("Incorrect or missing information")
				return
			}

			const data = {
				roleId: roleId,
				emoji: emoji,
				description: description
			}

			const rmRole = new RoleManagerRole(data)
			//  var rm = postgre.getRM({guild_id: message.guild.id, channel_id: channel.id, msg_id: msg_id})
			channel.messages.fetch().then(messages => {
				// Cant find message by id
				// console.log(messages)
				// var msgs = messages.filter(msg => msg.id == msg_id)
				// console.log(msgs)
			})

		} else if (action === "remove") {
			const msgId = params[2]
			const role = params[3]
		} else message.channel.send("Unknown action.")
	}


	// Adds twitch user to monitoring list
	else if (message.content.startsWith(config.General.prefix + "twadd") && M.MONITORING && isAdmin) {
		const name = message.content.split(" ")[1]
		const usersInfo = twitch.getUsersByNames(name)

		usersInfo.then((data: any) => {
			if (data.users.length > 0) {
				const user = {
					"user_id": data.users[0]._id,
					"user_name": data.users[0].display_name,
					"stream_status": "offline"
				}
				postgre.addTwitchUser(user)
				message.channel.send("Twitch user '" + name + "' was successfully added!").then(msg => {
					msg.delete({timeout: 2000})
				})
			} else message.channel.send("Wasn't able to add new twitch user.").then(msg => {
				msg.delete({timeout: 2000})
			})
		})
	}


	// Removes twitch user from monitoring list
	else if (message.content.startsWith(config.General.prefix + "twdel") && M.MONITORING && isAdmin) {
		const name = message.content.split(" ")[1]
		postgre.deleteTwitchUser(name)
		message.channel.send("Done!").then(msg => {
			msg.delete({timeout: 2000})
		})
	}


	// URL shortener
	else if (message.content.startsWith(config.General.prefix + "shorten") && M.MISC) {
		const url = message.content.split(" ")[1]

		req(`https://is.gd/create.php?format=simple&url=${url}`, (err, res, body) => {
			if (err) message.channel.send('Unfortunately wasn\'t able to shorten that link.')
			else message.channel.send(`Shorten URL: ${body}`)
		})
	}


	// Adds emoji
	else if (message.content.startsWith(config.General.prefix + "addemoji") && M.MISC) {
		const code = message.content.split(" ")[1]
		const snowflake = message.content.split(" ")[2]
		const emojiExists = await postgre.getEmoji(code)

		if (!emojiExists) {
			const emoji = {
				code: code,
				snowflake: snowflake
			}
			await postgre.addEmoji(emoji)
			message.channel.send(`Emoji :${code}: was successfully added!`).then(msg => {
				msg.delete({timeout: 2000})
			})
		} else {
			message.channel.send("Emoji with such name already exists").then(msg => {
				msg.delete({timeout: 2000})
			})
		}
	}


	// Deletes emoji
	else if (message.content.startsWith(config.General.prefix + "delemoji") && M.MISC) {
		const code = message.content.split(" ")[1]
		const emojiExists = await postgre.getEmoji(code)

		if (emojiExists) {
			await postgre.deleteEmoji(code)
			message.channel.send(`Emoji :${code}: was successfully deleted!`).then(msg => {
				msg.delete({timeout: 2000})
			})
		} else {
			message.channel.send("Emoji with such name does not exist").then(msg => {
				msg.delete({timeout: 2000})
			})
		}
	}


	// Resends message with custom emojis
	else if (hasRole(message.member, config.Misc.Emoji.roleId) && hasEmoji(message.content)) {
		let modifiedMessage = message.content
		let response = message.content
		const emojiRegex = /<a?:[a-zA-Z0-9_]+:[0-9]+>/g
		const codeRegex = /:[a-zA-Z0-9_]+:/g

		modifiedMessage.match(emojiRegex)?.forEach((msg: string) => {
			modifiedMessage = modifiedMessage.replace(msg, "")
		})

		modifiedMessage.match(codeRegex)?.forEach(async (msg: string) => {
			const emojiCode = msg.substring(1, msg.length - 1)
			const customEmoji = await postgre.getEmoji(emojiCode)
			response = response.replace(msg, customEmoji)

			await emojihook.edit({
				channel: message.channel.id
			})

			emojihook.send(response, {
				username: message.member!.displayName,
				avatarURL: message.author.avatarURL()
			})
		})
	}
})

client.login(config.General.token)
