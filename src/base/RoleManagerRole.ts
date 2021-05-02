/**
 * Single role object class
 * @attr {string} role_id - id of role to make self-assignable in RoleManager
 * @attr {string} emoji - unicode of emoji to use as a role assigning reaction
 * @attr {string} description - brief description of role
 */
export class RoleManagerRole {
	roleId: string
	emoji: string
	description: string

	/**
	 * @param {Object} data object to take information from
	 */
	constructor(data: any = {}) {
		this.roleId = data.role_id
		this.emoji = data.emoji
		this.description = data.description
	}

	/**
	 * Sets role id
	 * @param {string} id
	 */
	setRoleId(id: string) {
		this.roleId = id
	}

	/**
	 * Sets role's emoji code
	 * @param {string} code - unicode representation of emoji
	 */
	setEmoji(code: string) {
		this.emoji = code
	}

	/**
	 * Returns unicode emoji character
	 */
	getEmoji() {
		return unescape(this.emoji)
	}

	/**
	 * Sets role description to show in rolemanager
	 * @param {string} text
	 */
	setDescription(text: string) {
		this.description = text
	}
}
