import * as Gamedig from 'gamedig'


/**
 * Fetches server's information
 */
export class ServerInfoResource {

  constructor() {}

  /**
   * @param {string} ip - server host ip address
   * @param {string} port - server host port
   * @param {string} game - game short code (default: css)
   * full list of games can be found at "https://github.com/sonicsnes/node-gamedig"
   * @returns {Promise<any>} object with information about game server
   */
  getServerInfo(ip: string, port: string, game: string ='css'): Promise<any> {
    const queryData: any = {
        type: game,
        host: ip,
        port: port
    }

    return Gamedig.query(queryData).then((data) => {
        return {
          status: 'online',
          serverName: data.name,
          serverIP: data.connect,
          serverMap: data.map,
          maxplayers: data.maxplayers,
          players: data.players,
          bots: data.bots
        }
    }).catch(() => {
      return {
        status: 'offline'
      }
    })
  }
}
