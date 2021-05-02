import {BaseCommand} from '../../base/BaseCommand'
import {Dict} from '../../base/DictionaryObject'
import {postgre} from '../../index'


const attributes = new Dict({
	name: 'ytadd',
	argTypes: [String],
	description: 'Adds youtube channel to monitoring list',
	usage: 'ytadd <channelId>'
})

export const instance = new class extends BaseCommand {
	execute(message: any, args: any[]): void {
		const channelId: string = args[0]
		const now = new Date()
		const channel = {
			channelId: args[0],
			lastUploadDate: now.getTime(),
			streamStatus: 'offline'
		}

		postgre.addYoutubeChannel(channel)
	}
}(attributes)
