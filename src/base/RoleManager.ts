import * as Discord from 'discord.js'


/**
 * A rich embed with a fluent interface for self-assignable roles.
 * @attr {Object} guild - discord guild object
 * @attr {Object} channel - Discord channel object
 * @attr {string} msg_id - embed message id
 * @attr {string} title - title of embed message
 * @attr {integer} color - color of embed message
 */
export class RoleManager {
	guild: Discord.GuildChannel
	channel: Discord.TextChannel
	msgId: string
	title: string
	color: string

	/**
	 * @param {Object} data - object to take information from
	 */
	constructor(data: any = {}) {
		this.guild = data.guild
		this.channel = data.channel
		this.msgId = data.msgId
		this.title = data.title === undefined ? '' : data.title
		this.color = data.color === undefined ? 0 : data.color
	}

	/**
	 * Sets title of the rolemanager's embed message
	 * @param {string} title
	 */
	setTitle(title: string) {
		this.title = title
	}

	/**
	 * Sets color of the rolemanager's embed message
	 * @param {string} color
	 */
	setColor(color: string) {
		this.color = color
	}

	/**
	 * Creates new Rolemanager object,
	 * sends embed message in channel
	 * @returns {RoleManager} object
	 */
	create() {
		const embed = new Discord.MessageEmbed()
			.setTitle(this.title)
			.setColor(this.color)

		return this.channel.send(embed).then((msg) => {
			return this
		})
	}
}
