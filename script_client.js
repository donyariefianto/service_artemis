
const https = require("https")

class Fetchs {
  async httpsPost(hostname, path, data, ssl) {
    return new Promise(async (resolve, reject) => {
      const options = {
        hostname: hostname,
        path: path,
        port: 443,
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
const fetchs =  new Fetchs()


var hostname = "192.168.2.102", path="/artemis-web/debug/", data={}, ssl=false

Runner()

async function Runner () {
    console.log(await fetchs.httpsPost(hostname, path, data, ssl));

}