import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import axios from 'axios'
import {Message} from 'discord.js'


const attributes: Dict = new Dict({
	name: 'shorten',
	minArgs: 1,
	maxArgs: 1,
	description: 'Url Shortener',
	usage: 'shorten <url>',
	permissions: [],
	module: 'MISC'
})

export const instance = new class extends CommandBase {
	execute(message: Message, [url]: any[]): void {
		axios({
			method: 'GET',
			url: `https://is.gd/create.php`,
			params: {
				format: 'simple',
				url: url
			}
		}).then(res => {
				message.channel.send(`Shortened URL: ${res.data}`)
		}).catch(err => message.channel.send('Unfortunately wasn\'t able to shorten that link.'))
	}
}(attributes)
