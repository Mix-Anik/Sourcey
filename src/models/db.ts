import {Pool, QueryResult} from 'pg'


export class PostgreManager {
	host: string
	port: number
	name: string
	user: string
	pass: string
	client: Pool

	constructor(host: string, port: number, name: string, user: string, pass: string) {
		this.host = host
		this.port = port
		this.name = name
		this.user = user
		this.pass = pass
		this.client = new Pool({
			host: this.host,
			port: this.port,
			database: this.name,
			user: this.user,
			password: this.pass,
			max: 20,
			connectionTimeoutMillis: 20000,
			idleTimeoutMillis: 5000
		})
	}

	// Checks if all required tables exist
	async verify() {
		await this.verifyGroupTable()
		await this.verifyTwitchTable()
		await this.verifyYoutubeTable()
		await this.verifyRMTables()
		await this.verifyEmojiTable()
	}

	// Checks if db table for VK groups exist and creates it if it does not exist
	async verifyGroupTable(table: string = "vk_groups") {
		await this.client.query("CREATE TABLE IF NOT EXISTS " + table + "(id serial PRIMARY KEY, group_id VARCHAR (64) UNIQUE NOT NULL, last_post_id INTEGER NULL);", () => {
			// console.log("Table " + name + " was checked!")
		})
	}

	// Adds new VK group data
	async addGroup(data: any, table: string = "vk_groups") {
		await this.client.query("INSERT INTO public." + table + "(group_id, last_post_id) VALUES ('" + data.group_id + "', '" + data.last_post_id + "') ON CONFLICT (group_id) DO NOTHING;", () => {
			// if (res.rowCount == 0) console.log("Group was not added.")
			// else console.log("New group has been added!")
		})
	}

	// Updates VK group data
	async updateGroup(data: any, table: string = "vk_groups") {
		await this.client.query("UPDATE public." + table + " SET last_post_id = '" + data.last_post_id + "' WHERE group_id = '" + data.group_id + "';", () => {
			// if (res.rowCount == 0) console.log("Group was not updated.")
			// else console.log("Group has been updated!")
		})
	}

	// Returns VK group last post id <Promise>
	async getGroupLast(groupId: string, table: string = "vk_groups"): Promise<number> {
		return new Promise(async (resolve) => {
			await this.client.query("SELECT last_post_id FROM public." + table + " WHERE group_id = '" + groupId + "';").then((res: QueryResult) => {
				if (res.rowCount === 0) {
					// console.log("Group was not found.")
					resolve(-1)
				} else {
					// console.log("Group with id='"+group_id+"' was found!")
					resolve(res.rows[0].last_post_id)
				}
			})
		})
	}

	// Checks if VK group exists in database & returns <Promise> with True/False
	async checkGroup(groupId: string, table: string = "vk_groups"): Promise<boolean> {
		return new Promise(async (resolve) => {
			await this.client.query("SELECT EXISTS(SELECT * FROM public." + table + " WHERE group_id='" + groupId + "');").then((res: QueryResult) => {
				resolve(res.rows[0].exists)
			})
		})
	}

	// Checks if db table for Twitch users exist and creates it if it does not exist
	async verifyTwitchTable(name: string = "twitch_users") {
		await this.client.query("CREATE TABLE IF NOT EXISTS " + name + "(id serial PRIMARY KEY, user_id VARCHAR (64) UNIQUE NOT NULL, user_name VARCHAR (128) UNIQUE NOT NULL, stream_status VARCHAR (32) NULL);", () => {
			// console.log("Table " + name + " was checked!")
		})
	}

	// Adds new twitch user
	async addTwitchUser(user: any, table: string = "twitch_users") {
		await this.client.query("INSERT INTO public." + table + "(user_id, user_name, stream_status) VALUES ('" + user.user_id + "', '" + user.user_name + "', '" + user.stream_status + "') ON CONFLICT (user_id) DO NOTHING;", () => {
			// if (res.rowCount == 0) console.log("User was not added.")
			// else console.log("New user has been added!")
		})
	}

	// Removes twitch user
	async deleteTwitchUser(userName: string, table: string = "twitch_users") {
		await this.client.query("DELETE FROM public." + table + " WHERE user_name = '" + userName + "';", () => {
			// if (res.rowCount == 0) console.log("User was not added.")
			// else console.log("New user has been added!")
		})
	}

	// Updates twitch user streaming status
	async updateTwitchStreamStatus(user: any, table: string = "twitch_users") {
		await this.client.query("UPDATE public." + table + " SET stream_status = '" + user.stream_status + "' WHERE user_id = '" + user.user_id + "';", () => {
			// if (res.rowCount == 0) console.log("Couldn't find user with specified 'user id'.")
			// else console.log("User streaming status updated!")
		})
	}

	// Returns all twitch users (id & name)
	async getTwitchUsers(table: string = "twitch_users"): Promise<any[]> {
		return new Promise(async (resolve) => {
			await this.client.query("SELECT user_id, user_name, stream_status FROM public." + table + ";").then((res: QueryResult) => {
				if (res.rowCount === 0) {
					// console.log("None users were found.")
					resolve([])
				} else {
					// console.log(res.rows.length + " twitch users were found!")
					const usersInfo = []
					for (const row of res.rows) {
						const info = {
							"user_id": row.user_id,
							"user_name": row.user_name,
							"stream_status": row.stream_status
						}
						usersInfo.push(info)
					}

					resolve(usersInfo)
				}
			})
		})
	}

	// Checks if db table for youtube channels exist and creates it if it does not exist
	async verifyYoutubeTable(name: string = "youtube_channels") {
		await this.client.query("CREATE TABLE IF NOT EXISTS " + name + "(id serial PRIMARY KEY, channel_id VARCHAR (64) UNIQUE NOT NULL, last_upload_date VARCHAR (16) NOT NULL, stream_status VARCHAR (32) NULL);", () => {
			// console.log("Table " + name + " was checked!")
		})
	}

	// Adds new youtube channel
	async addYoutubeChannel(channel: any, table: string = "youtube_channels") {
		await this.client.query("INSERT INTO public." + table + "(channel_id, last_upload_date, stream_status) VALUES ('" + channel.channelId + "', '" + channel.lastUploadDate + "', '" + channel.streamStatus + "') ON CONFLICT (channel_id) DO NOTHING;", () => {
			// if (res.rowCount == 0) console.log("User was not added.")
			// else console.log("New user has been added!")
		})
	}

	// Removes youtube channel
	async deleteYoutubeChannel(channelId: string, table: string = "youtube_channels") {
		await this.client.query("DELETE FROM public." + table + " WHERE channel_id = '" + channelId + "';", () => {
			// if (res.rowCount == 0) console.log("User was not added.")
			// else console.log("New user has been added!")
		})
	}

	// Updates youtube channel last upload date
	async updateYoutubeLUD(channel: any, table: string = "youtube_channels") {
		await this.client.query("UPDATE public." + table + " SET last_upload_date = '" + channel.lastUploadDate + "' WHERE channel_id = '" + channel.channelId + "';", () => {
			// if (res.rowCount == 0) console.log("Couldn't find channel with specified 'channel id'.")
			// else console.log("User streaming status updated!")
		})
	}

	// Updates youtube channel streaming status
	async updateYoutubeStreamStatus(channel: any, table: string = "youtube_channels") {
		await this.client.query("UPDATE public." + table + " SET stream_status = '" + channel.streamStatus + "' WHERE channel_id = '" + channel.channelId + "';", () => {
			// if (res.rowCount == 0) console.log("Couldn't find channel with specified 'channel id'.")
			// else console.log("User streaming status updated!")
		})
	}

	// Returns all youtube channels (id & name)
	async getYoutubeChannels(table: string = "youtube_channels"): Promise<any[]> {
		return new Promise(async (resolve) => {
			await this.client.query("SELECT channel_id, last_upload_date, stream_status FROM public." + table + ";").then((res: QueryResult) => {
				const channelsInfo = []

				for (const row of res.rows) {
					const info = {
						"id": row.channel_id,
						"lastUploadDate": row.last_upload_date,
						"streamStatus": row.stream_status
					}
					channelsInfo.push(info)
				}

				resolve(channelsInfo)
			})
		})
	}

	// Checks if db table for rolemanagers and roles exist and creates it if it does not exist
	async verifyRMTables(rmTable: string = "rm_objects", rTable: string = "rm_roles") {
		await this.client.query("CREATE TABLE IF NOT EXISTS " + rmTable + "(id serial PRIMARY KEY, guild_id VARCHAR (64) NOT NULL, channel_id VARCHAR (64) NOT NULL, msg_id VARCHAR (64) NOT NULL, title VARCHAR (64) NOT NULL, color VARCHAR (16) NOT NULL);", () => {
			// console.log("Table " + rm_name + " was checked!")
		})
		await this.client.query("CREATE TABLE IF NOT EXISTS " + rTable + "(id serial PRIMARY KEY, rm_id INTEGER REFERENCES public." + rmTable + " (id) ON DELETE CASCADE, role_id VARCHAR (64) NOT NULL, emoji_id VARCHAR (64) NOT NULL, description VARCHAR (128) NULL);", () => {
			// console.log("Table " + r_name + " was checked!")
		})
	}

	// Adds new rolemanager
	async addRM(roleManager: any, table: string = "rm_objects") {
		await this.client.query("INSERT INTO public." + table + "(guild_id, channel_id, msg_id, title, color) VALUES ('" + roleManager.guild.id + "', '" + roleManager.channel.id + "', '" + roleManager.msg_id + "', '" + roleManager.title + "', '" + roleManager.color + "');", () => {
			// if (res.rowCount == 0) console.log("User was not added.")
			// else console.log("New user has been added!")
		})
	}

	// Adds new rolemanager's role
	async addRMRole(data: any, table: string = "rm_roles") {
		await this.client.query("INSERT INTO public." + table + "(rm_id, role_id, emoji_id, description) VALUES ('" + data.rm_id + "', '" + data.role_id + "', '" + data.emoji_id + "', '" + data.description + "');", () => {
			// if (res.rowCount == 0) console.log("Role was not added.")
			// else console.log("New role has been added!")
		})
	}

	// Deletes rolemanager & roles in relation with it
	async deleteRM(rmId: number, table: string = "rm_objects") {
		await this.client.query("DELETE FROM public." + table + " WHERE id = '" + rmId + "';", () => {
			// if (res.rowCount == 0) console.log("User was not added.")
			// else console.log("New user has been added!")
		})
	}

	// Deletes rolemanager's role
	async deleteRMRole(role: any, table: string = "rm_roles") {
		await this.client.query("DELETE FROM public." + table + " WHERE id = '" + role.id + "' AND role_id = '" + role.role_id + "';", () => {
			// if (res.rowCount == 0) console.log("User was not added.")
			// else console.log("New user has been added!")
		})
	}

	// Retrieves single rolemanager
	async getRM(data: any, table: string = "rm_objects"): Promise<any> {
		return new Promise(async (resolve) => {
			await this.client.query("SELECT * FROM public." + table + " WHERE guild_id = '" + data.guild_id + "' AND channel_id = '" + data.channel_id + "' AND msg_id = '" + data.msg_id + "';").then((res: QueryResult) => {
				if (res.rowCount === 0) {
					// console.log("None RMs were found.")
					resolve(-1)
				} else {
					// console.log("RM id found!")
					const info = {
						"id": res.rows[0].id,
						"guild_id": res.rows[0].guild_id,
						"channel_id": res.rows[0].channel_id,
						"msg_id": res.rows[0].msg_id,
						"title": res.rows[0].title,
						"color": res.rows[0].color
					}

					resolve(info)
				}
			})
		})
	}

	// Retrieves all rolemanager objects
	async getAllRMs(table: string = "rm_objects"): Promise<any[]> {
		return new Promise(async (resolve) => {
			await this.client.query("SELECT * FROM public." + table + ";").then((res: QueryResult) => {
				if (res.rowCount === 0) {
					// console.log("None RMs were found.")
					resolve([])
				} else {
					// console.log(res.rows.length + " RMs were found!")
					const rolemanagers = []
					for (const row of res.rows) {
						const info = {
							"id": row.id,
							"guild_id": row.guild_id,
							"channel_id": row.channel_id,
							"msg_id": row.msg_id,
							"title": row.title,
							"color": row.color
						}
						rolemanagers.push(info)
					}

					resolve(rolemanagers)
				}
			})
		})
	}

	// Checks if db table for emojis exist and creates it if it does not exist
	async verifyEmojiTable(name: string = "emojis") {
		await this.client.query("CREATE TABLE IF NOT EXISTS " + name + "(id serial PRIMARY KEY, code VARCHAR (512) UNIQUE NOT NULL, snowflake VARCHAR (512) NOT NULL);", () => {
			// console.log("Table " + name + " was checked!")
		})
	}

	// Adds new emoji
	async addEmoji(emoji: any, table: string = "emojis") {
		await this.client.query("INSERT INTO public." + table + "(code, snowflake) VALUES ('" + emoji.code + "', '" + emoji.snowflake + "') ON CONFLICT (code) DO NOTHING;", () => {
			// if (res.rowCount == 0) console.log("Emoji was not added.")
			// else console.log("New emoji has been added!")
		})
	}

	// Deletes emoji
	async deleteEmoji(emojiCode: string, table: string = "emojis") {
		await this.client.query("DELETE FROM public." + table + " WHERE code = '" + emojiCode + "';", () => {
			// if (res.rowCount == 0) console.log("Could not delete emoji.")
			// else console.log("Emoji was deleted!")
		})
	}

	// Fetches emoji by code
	async getEmoji(emojiCode: string, table: string = "emojis"): Promise<string> {
		return new Promise(async (resolve) => {
			await this.client.query("SELECT snowflake FROM public." + table + " WHERE code = '" + emojiCode + "';").then((res: QueryResult) => {
				if (res.rowCount === 0) {
					// console.log("Emoji was not found.")
					resolve('')
				} else {
					// console.log("Emoji with code='"+emojiCode+"' was found!")
					const fullCode = `<:${emojiCode}:${res.rows[0].snowflake}>`
					resolve(fullCode)
				}
			})
		})
	}
}
