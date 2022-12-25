import {CommandBase} from '../../base/CommandBase'
import {Dict} from '../../base/Dictionary'
import translate from '@iamtraction/google-translate'
import {Logger} from '../../utils/logging'
import {Message} from 'discord.js'


const attributes: Dict = new Dict({
	name: 'translate',
	minArgs: 3,
	maxArgs: 3,
	description: 'Translate message to another language',
	usage: 'translate <from> <to> "<text>"',
	permissions: [],
	module: 'MISC',
	cooldown: 0
})

export const instance = new class extends CommandBase {
	execute(message: Message, [langFrom, langTo, text]: any[]): void {
		if (this.availableLanguages.includes(langFrom) && this.availableLanguages.includes(langTo)) {
			const options: any = {
				from: langFrom,
				to: langTo
			}

			translate(text, options).then(res => {
				message.channel.send(`Translation: **${res.text}**`)
			}).catch(err => Logger.error(message.guild.id, `Failed to translate due to '${err}'`, true))
		} else {
			message.channel.send(`Unknown language: '${langFrom}' or '${langTo}'`)
		}
	}

	private availableLanguages = [
		'auto',
		'af',
		'sq',
		'am',
		'ar',
		'hy',
		'az',
		'eu',
		'be',
		'bn',
		'bs',
		'bg',
		'ca',
		'ceb',
		'ny',
		'zh-cn',
		'zh-tw',
		'co',
		'hr',
		'cs',
		'da',
		'nl',
		'en',
		'eo',
		'et',
		'tl',
		'fi',
		'fr',
		'fy',
		'gl',
		'ka',
		'de',
		'el',
		'gu',
		'ht',
		'ha',
		'haw',
		'iw',
		'hi',
		'hmn',
		'hu',
		'is',
		'ig',
		'id',
		'ga',
		'it',
		'ja',
		'jw',
		'kn',
		'kk',
		'km',
		'ko',
		'ku',
		'ky',
		'lo',
		'la',
		'lv',
		'lt',
		'lb',
		'mk',
		'mg',
		'ms',
		'ml',
		'mt',
		'mi',
		'mr',
		'mn',
		'my',
		'ne',
		'no',
		'ps',
		'fa',
		'pl',
		'pt',
		'pa',
		'ro',
		'ru',
		'sm',
		'gd',
		'sr',
		'st',
		'sn',
		'sd',
		'si',
		'sk',
		'sl',
		'so',
		'es',
		'su',
		'sw',
		'sv',
		'tg',
		'ta',
		'te',
		'th',
		'tr',
		'uk',
		'ur',
		'uz',
		'vi',
		'cy',
		'xh',
		'yi',
		'yo',
		'zu'
	]
}(attributes)
