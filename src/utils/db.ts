import {Connection, createConnection, getConnection} from 'typeorm'
import ORMConfig from '../ormconfig'
import {Logger} from './logging'


export const establishDatabaseConnection = async () => {
  let connection: Connection | undefined
  try {
    connection = getConnection()
  } catch (e) {}

  try {
    if (connection) {
      if (!connection.isConnected) {
        await connection.connect()
      }
    } else {
      await createConnection(ORMConfig)
    }

    Logger.internalLog('Successfully connected to the database', true)
  } catch (e) {
    Logger.internalLog(`Failed to establish connection to the database: ${e}`, true)
  }
}
