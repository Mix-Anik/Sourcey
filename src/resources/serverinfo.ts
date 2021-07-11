import {query as queryServer, QueryResult} from 'gamedig'


/**
 * Fetches server's information
 */
export class ServerInfoResource {
  private static _instance: ServerInfoResource | undefined

  private constructor() {}

  public static instance() {
		if (this._instance === undefined)
			this._instance = new ServerInfoResource()

		return this._instance
	}

  /**
   * @param {string} ip - server host ip address
   * @param {string} port - server host port
   * @param {string} game - game short code (default: css)
   * full list of games can be found at "https://github.com/sonicsnes/node-gamedig"
   * @returns {Promise<any>} object with information about game server
   */
  public getServerInfo(ip: string, port: number, game: string ='css'): Promise<any> {
    return new Promise(resolve => {
      const queryData: any = {
        type: game,
        host: ip,
        port: port
      }

      queryServer(queryData).then((data: QueryResult) => {
        resolve({
          status: 'online',
          serverName: data.name,
          serverIP: data.connect,
          serverMap: data.map,
          maxplayers: data.maxplayers,
          players: data.players,
          bots: data.bots
        })
      }).catch(() => {
        resolve({
          status: 'offline'
        })
      })
    })
  }
}
