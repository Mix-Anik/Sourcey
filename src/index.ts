import { ShardingManager } from 'discord.js'
import config from './config.json'
import {Logger} from './utils/logging'


const manager = new ShardingManager('src/app.ts', { token: config.General.token })

manager.on('shardCreate', shard => Logger.internalLog(`Launched shard ${shard.id}`, true))
manager.spawn()
