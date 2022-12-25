export interface IGuildConfig {
	General: IConfigGeneral
	Modules: IConfigModules
	Logger: IConfigLogger
	Webhook: IConfigWebhook
}

interface IConfigGeneral {
	prefix: string
}

interface IConfigModules {
	COMMON: IConfigCommon
	MANAGEMENT: IConfigManagement
	ADMINISTRATION: IConfigAdministration
	MONITORING: IConfigMonitoring
	GAMING: IConfigGaming
	MISC: IConfigMisc
}

interface IConfigCommon {
	enabled: boolean
	embedColor: string
}

interface IConfigManagement {
	enabled: boolean
	embedColor: string
}

interface IConfigAdministration {
	enabled: boolean
	embedColor: string
	muteRoleId: string | null
	muteRoleName: string
	muteRolePermissions: number
}

interface IConfigMonitoring {
	enabled: boolean
	embedColor: string
	c2d: IMonitoringC2D
	servers: IMonitoringServers
	vk: IMonitoringVk
	twitch: IMonitoringTwitch
	youtube: IMonitoringYoutube
}

interface IConfigGaming {
	enabled: boolean
	embedColor: string
}

interface IConfigMisc {
	enabled: boolean
	embedColor: string
	emojiRoleId: string
}

interface IConfigLogger {
	channelId: string | null
}

interface IConfigWebhook {
	id: string | null
	token: string | null
}



interface IMonitoringC2D {
	channelId: string | null
	socketPort: number
	serverIp: string | null
	secret: string | null
	color: string
}

interface IMonitoringServers {
	updateTime: number
	channelId: string | null
	showPlayers: boolean
}

interface IMonitoringVk {
	updateTime: number
	groupId: string | null
	postsToCheck: number
	ownerOnly: boolean
	channelId: string | null
}

interface IMonitoringTwitch {
	updateTime: number
	channelId: string | null
}

interface IMonitoringYoutube {
	updateTime: number
	channelId: string | null
}
