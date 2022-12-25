import {ConnectionOptions} from 'typeorm'
import path from 'path'


const isCompiled = path.extname(__filename).includes('js')

export default {
   type: 'postgres',
   host: '127.0.0.1',
   port: 5432,
   username: 'postgres',
   password: 'postgres',
   database: 'testing',
   synchronize: true, // TODO: disable this and logging for production
   logging: true,
   autoReconnect: true,
   reconnectTried: Number.MAX_VALUE,
   reconnectInterval: 2000,
   entities: [
      `src/base/models/**/*.model.${isCompiled ? 'js' : 'ts'}`
   ],
   migrations: [
      `src/base/migrations/**/*.${isCompiled ? 'js' : 'ts'}`
   ],
   cli: {
      'entitiesDir': 'src/base/models',
      'migrationsDir': 'src/base/migrations'
   }
} as ConnectionOptions
