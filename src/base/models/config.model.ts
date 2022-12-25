import {Entity, Column, Index} from 'typeorm'
import {BaseModel} from '../BaseModel'
import {IGuildConfig} from '../interfaces/guildConfig'


const defaultConfig: IGuildConfig = {
	General: {
		prefix: '~'
	},
	Modules: {
		COMMON: {
			enabled: true,
			embedColor: '#828282'
		},
		MANAGEMENT: {
			enabled: true,
			embedColor: '#62b4ff',
		},
		ADMINISTRATION: {
			enabled: true,
			embedColor: '#e86666',
			muteRoleId: null,
			muteRoleName: 'Muted',
			muteRolePermissions: 35112000
		},
		MONITORING: {
			enabled: true,
			embedColor: '#f57514',
			c2d: {
				channelId: null,
				socketPort: 50000,
				serverIp: null,
				secret: null,
				color: '#8add80'
			},
			servers: {
				updateTime: 15000,
				channelId: null,
				showPlayers: true // TODO: make have effect and switchable
			},
			vk: {
				updateTime: 30000,
				groupId: null,
				postsToCheck: 3,
				ownerOnly: true,
				channelId: null,
			},
			twitch: {
				updateTime: 10000,
				channelId: null
			},
			youtube: {
				updateTime: 10000,
				channelId: null
			}
		},
		GAMING: {
			enabled: true,
			embedColor: '#c62dff'
		},
		MISC: {
			enabled: true,
			embedColor: '#a8efd4',
			emojiRoleId: '797596074490593309'
		}
	},

	Logger: {
		channelId: null
	},

	Webhook: {
		id: null,
		token: null
	}
}

@Entity()
export class GuildConfig extends BaseModel {
	@Index()
  @Column({
    length: 32,
    nullable: false,
    unique: true
  })
  guildId: string

	@Column({
		type: 'jsonb',
		nullable: false,
		default: defaultConfig
	})
	keyValues: IGuildConfig
}
