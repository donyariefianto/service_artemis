import { clientMinio } from '#services/minio'
import fetch_request from '#helpers/fetchs'
import axios from 'axios'
import env from '#start/env'
const minio_service = env.get("MINIO_SERVICE")
class MinIO {
  public getListObject(bucket: string, prefix: string) {
    return new Promise((resolve, reject) => {
      var body = []
      const objectsStream = clientMinio.data.listObjects(bucket, prefix)
      objectsStream.on('data', (obj) => {
        body.push(obj)
      })
      objectsStream.on('end', function () {
        resolve(body)
      })
      objectsStream.on('error', function (e) {
        reject(e)
      })
    })
  }
  public getObject(bucket: string, name: string, prefix: string) {
    return new Promise((resolve, reject) => {
      var body = []
      const objectsStream = clientMinio.data.fGetObject(bucket, name, prefix)
      resolve(objectsStream)
    })
  }
  public deleteObject(bucket: string, name: string) {
    return clientMinio.data.removeObject(bucket, name)
  }

  public putObject(bucket: string, name: string, data: any) {
    return clientMinio.data.putObject(bucket, name, data)
  }

  public async getObjectFile(file,date) {
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: minio_service+date+'/'+file,
        headers: { }
      };
      let res = await axios.request(config)
      return res.data
    } catch (error) {
      throw new Error('Minio: ' + error.message)
    }
  }
}
export default new MinIO()
