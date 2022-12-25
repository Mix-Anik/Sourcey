import {TextChannel, Webhook} from 'discord.js'
import {GuildConfigResource} from './config'

/**
 * Retrieves guild webhook or creates it
 */
export class WebhookResource {
  private static _instance: Webhook

  private constructor() {}

  public static async instance(guildId: string, channel: TextChannel): Promise<Webhook> {
  	return new Promise( async (resolve, reject) => {
  		if (this._instance === undefined) {
  			const configResource = GuildConfigResource.instance()
				const guildConfigEntity = configResource.get(guildId)
  			const guildWebHooks = await channel.guild.fetchWebhooks()
				const botWebHook = guildWebHooks.get(guildConfigEntity.keyValues.Webhook.id)

				if (botWebHook) {
					this._instance = botWebHook
				} else {
					const newWebhook = await channel.createWebhook('Sourcey')
					guildConfigEntity.keyValues.Webhook.id = newWebhook.id
					await configResource.update(guildId, guildConfigEntity)
					this._instance = newWebhook
				}
			}

			resolve(this._instance)
		})
	}
}
