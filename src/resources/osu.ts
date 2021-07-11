import {Api as osuApi} from 'node-osu'
import {sec2time} from '../utils/helpers'
import config from '../config.json'
import {Dict} from '../base/Dictionary'


export class OsuResource {
	private static _instance: OsuResource | undefined
	private api: osuApi

	private constructor() {
		this.api = new osuApi(config.Misc.Osu.apikey, {
			notFoundAsError: false, // Throw an error on not found instead of returning nothing. (default: true)
			completeScores: true, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
			parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
		})
	}

	public static instance() {
		if (this._instance === undefined)
			this._instance = new OsuResource()

		return this._instance
	}

	private packMods(mods: string[]) {
		const shortMods: Dict = new Dict({
			'NoFail': 'NF',
			'Easy': 'EZ',
			'Hidden': 'HD',
			'HardRock': 'HR',
			'SuddenDeath': 'SD',
			'DoubleTime': 'DT',
			'Relax': 'RX',
			'HalfTime': 'HT',
			'Nightcore': 'NC',
			'Flashlight': 'FL',
			'Autoplay': 'Auto',
			'SpunOut': 'SO',
			'Perfect': 'PF',
			'Cinema': 'CN'
		})

		const packed: string[] = []
		mods.forEach((mod: string) => {
			if (shortMods.get(mod) !== undefined) packed.push(shortMods.get(mod))
		})

		if (packed.length > 0) return packed.join('|')
		return 'NoMod'
	}

	// Shows osu player statistics by nickname
	public getPlayerStats(playerName: string): Promise<any> {
		const statsImage = 'http://lemmmy.pw/osusig/sig.php?colour=hex66ccff&uname=' + playerName + '&pp=0&removeavmargin&darktriangles&xpbar&xpbarhex'
		const user = this.api.getUser({u: playerName}).then((incomingUser: any) => {
			if (incomingUser.id !== undefined) return incomingUser
			else return -1
		})
		const bestScore = this.api.getUserBest({u: playerName}).then(async (bestScores: any) => {
			if (bestScores.length > 0) return bestScores[0]
			else return -1
		})
		const recentScore = this.api.getUserRecent({u: playerName}).then(async (recentScores: any) => {
			if (recentScores.length > 0) return recentScores[0]
			else return -1
		})

		return Promise.all([user, bestScore, recentScore]).then(([u, b, r]) => {
			if (u === -1) return false

			const osuLink = 'https://osu.ppy.sh/users/' + u.id
			const osuProfileImage = 'https://a.ppy.sh/' + u.id + '?avatar.png'
			const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',]
			const regDate = new Date(u.raw_joinDate)
			const formatedRegDate = regDate.getDate() + ' ' + months[regDate.getMonth()] + ' ' + regDate.getFullYear()
			const playtime = (parseInt(u.secondsPlayed, 10) / 3600).toFixed(2) + ' Hours'
			const bScore = (b === -1 || b._beatmap === -1) ? '```autohotkey\nMissing\n```' : ('```autohotkey\n' +
				'Beatmap: "' + b._beatmap.artist + ' - ' + b._beatmap.title + '"\n' +
				'Difficulty: "' + b._beatmap.version + ' (' + parseFloat(b._beatmap.difficulty.rating).toFixed(2) + '*)"\n' +
				'CS|AR|HP: ' + b._beatmap.difficulty.size + ' | ' + b._beatmap.difficulty.approach + ' | ' + b._beatmap.difficulty.drain + '\n' +
				'Length|BPM: ' + sec2time(b._beatmap.length.total, 2, false).replace(':', '.') + ' | ' + b._beatmap.bpm + '\n' +
				'Score: ' + parseInt(b.score, 10).toLocaleString() + '\n' +
				'Accuracy: ' + (b.accuracy * 100).toFixed(2) + '\n' +
				'Max Combo: ' + b.maxCombo + 'x\n' +
				'Mods: ' + this.packMods(b.mods) + '\n' +
				'PP Worth: ' + (b.pp == null ? '0' : b.pp) + ' (' + b._beatmap.approvalStatus + ')' + '\n' +
				'\n```')
			const rScore = (r === -1 || r._beatmap === -1) ? '```autohotkey\nMissing\n```' : ('```autohotkey\n' +
				'Beatmap: "' + r._beatmap.artist + ' - ' + r._beatmap.title + '"\n' +
				'Difficulty: "' + r._beatmap.version + ' (' + parseFloat(r._beatmap.difficulty.rating).toFixed(2) + '*)"\n' +
				'CS|AR|HP: ' + r._beatmap.difficulty.size + ' | ' + r._beatmap.difficulty.approach + ' | ' + r._beatmap.difficulty.drain + '\n' +
				'Length|BPM: ' + sec2time(r._beatmap.length.total, 2, false).replace(':', '.') + ' | ' + r._beatmap.bpm + '\n' +
				'Score: ' + parseInt(r.score, 10).toLocaleString() + '\n' +
				'Accuracy: ' + (r.accuracy * 100).toFixed(2) + '\n' +
				'Max Combo: ' + r.maxCombo + 'x\n' +
				'Mods: ' + this.packMods(r.mods) + '\n' +
				'PP Worth: ' + (r.pp == null ? '0' : r.pp) + ' (' + r._beatmap.approvalStatus + ')' + '\n' +
				'\n```')

			return {
				'userData': u,
				'profileLink': osuLink,
				'profileImage': osuProfileImage,
				'regDate': formatedRegDate,
				'playtime': playtime,
				'bestScore': bScore,
				'recentScore': rScore,
				'statsImage': statsImage
			}
		})
	}
}
