import {Message, Role, GuildMember} from 'discord.js'
import fs from 'fs'


// Converts date seconds into human understandable format
export function sec2time(timeInSeconds: number, fixed: number = 3, ms: boolean = true): string {
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
	formatedTime = formatedTime.replace('00:', '')

	return formatedTime
}

// Checks if object is empty
export function isEmpty(obj: object): boolean {
	for (const prop in obj) {
		if (obj.hasOwnProperty(prop)) return false
	}
	return true
}

// Checks whether member has role by id or not
export function hasRoleById(member: GuildMember | null, roleId: string): boolean {
	if (member) return member.roles.cache.has(roleId)

	return false
}

// Checks whether member has role by name or not
export function hasRoleByName(message: Message, roleName: string): boolean {
	const roleToAssign = message.guild!.roles.cache.find((r: Role) => r.name === roleName)

	if (roleToAssign) return hasRoleById(message.member, roleToAssign.id)

	return false
}

// Checks if command message is in valid format
export function isValid(message: Message): boolean {
	if (message.content.includes('  ')) {
		message.channel.send('Message has too many spaces!')
		return false
	}
	return true
}

// Checks if passed text has mentions
export function hasMentions(text: string, type: string): boolean {
	let mentionSign: string
	if (type === 'user')  mentionSign = '@!?'
	else if (type === 'role') mentionSign = '@&'
	else if (type === 'channel') mentionSign = '#'
	else return false

	const pattern = new RegExp(`<(${mentionSign})(\\d+)>`)
	return pattern.test(text)
}

// Returns mention id
export function parseMention(mention: string): string {
	const matchesMention = mention.match(/<(@[!&]?|#)(\d+)>/)
	if (matchesMention) return matchesMention[2] // returning second group element (0-input, 1-first group, 2-second group)
	else return mention // returning mention itself as it is just an id
}

// Returns emoji unicode
export function parseEmoji(emoji: string): string | undefined {
	const uEmoji = escape(emoji)
	if (uEmoji === emoji) return undefined
	return uEmoji
}

// Checks if message contains any emoji representation calls
export function hasEmoji(message: string): boolean {
	const regExp = /:[a-zA-Z0-9_]+:/
	return regExp.test(message)
}

// Retrieves all files located in given directory
export function getAllFiles(directory: string): string[] {
	let files: string[] = []

	fs.readdirSync(directory).filter(file => {
		const fullPath = directory + '/' + file

		if (file.endsWith('.ts')) {
			files.push(fullPath)
		} else if (fs.statSync(fullPath).isDirectory()) {
			files = files.concat(getAllFiles(fullPath))
		}
	})

	return files
}

// Returns current local datetime
export function getCurrentTime(): string {
	const now = new Date()
	const day = nPad(now.getDay(), 2)
	const month = nPad(now.getMonth(), 2)
	const year = nPad(now.getFullYear(), 2)
	const h = nPad(now.getHours(), 2)
	const min = nPad(now.getMinutes(), 2)
	const sec = nPad(now.getSeconds(), 2)
	const ms = nPad(now.getMilliseconds(), 3)

	return `${day}/${month}/${year} ${h}:${min}:${sec}.${ms}`
}

// pads number with zeros
export function nPad(num: number, length: number): string {
	return num.toString().padStart(length, '0')
}

// Checks if passed text is a channel mention
export function isChannelMention(text: string): boolean {
	return /<#\d+>/.test(text)
}

// Truncates string to given length
export function truncate(text: string, len: number) {
  if (text.length <= len) {
    return text
  }

  return text.slice(0, len) + '...'
}

// Clamps number to given interval
export function clamp(num: number, min: number, max: number) {
	return (num < min) ? min : ((num > max) ? max : num)
}
