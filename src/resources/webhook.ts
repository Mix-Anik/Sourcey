import {TextChannel, Webhook} from 'discord.js'
import config from '../config.json'

/**
 * Retrieves guild webhook or creates it
 */
export class WebhookResource {
  private static _instance: Webhook

  private constructor() {}

  public static async instance(channel: TextChannel): Promise<Webhook> {
  	return new Promise( async (resolve, reject) => {
  		if (this._instance === undefined) {
  			const guildWebHooks = await channel.guild.fetchWebhooks()
				const botWebHook = guildWebHooks.get(config.Webhook.id)

				if (botWebHook) {
					this._instance = botWebHook
				} else {
					const newWebhook = await channel.createWebhook('Sourcey')
					config.Webhook.id = newWebhook.id
					this._instance = newWebhook
				}
			}

			resolve(this._instance)
		})
	}
}
