import * as https from 'https'

class Fetchs {
  public async httpsPost(hostname: string, path: string, data: Object, ssl: boolean, port: number) {
    return new Promise(async (resolve, reject) => {
      if (!port) {
        port = 443
      }
      const options = {
        hostname: hostname,
        path: path,
        port: port,
        method: 'POST',
        rejectUnauthorized: ssl,
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const body = []
      const req = https.request(options, (res) => {
        res.on('data', (d) => {
          body.push(d)
        })
        res.on('end', () => {
          resolve(JSON.parse(Buffer.concat(body).toString()))
        })
      })
      req.on('error', (e) => {
        reject(e)
      })
      req.write(JSON.stringify(data))
      req.end()
    })
  }
}
export default new Fetchs()
