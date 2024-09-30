import fetch_request from '#helpers/fetchs'
import env from '#start/env'
import moment from 'moment'
import mongodb from '#helpers/mongodb'
import minio from './minio.js'

import { Readable } from 'stream'
import b64 from '#helpers/base64'
const artemis_hostname = env.get('ARTEMIS_HOSTNAME')
const artemis_debug_path = env.get('ARTEMIS_PATH_DEBUG')
const artemis_ssl = Boolean(JSON.parse(env.get('ARTEMIS_SSL')))

class Artemis {
  public async SaveANPR_FaceRM() {
    let vehicleType = [{ id: 0, descrition: 'others' },{ id: 1, descrition: 'passenger vehicle' },{ id: 2, descrition: 'truck' },{ id: 3, descrition: 'sedan' },{ id: 4, descrition: 'minivan' },{ id: 5, descrition: 'light truck' },{ id: 6, descrition: 'pedestrian' },{ id: 7, descrition: 'two wheeler' },{ id: 8, descrition: 'tricycle' },{ id: 9, descrition: 'suv/mpv' },{ id: 10, descrition: 'middle-sized bus' },{ id: 11, descrition: 'motor vehicle' },{ id: 12, descrition: 'non motor vehicle' },{ id: 13, descrition: 'small sedan' },{ id: 14, descrition: 'mini sedan' },{ id: 15, descrition: 'pickup truck' },{ id: 16, descrition: 'container truck' },{ id: 17, descrition: 'minitruck and dropside trailer' },{ id: 18, descrition: 'dump truck' },{ id: 19, descrition: 'crane and engineering vehicle' },{ id: 20, descrition: 'oil tank truck' },{ id: 21, descrition: 'concrete mixer' },{ id: 22, descrition: 'flatbed tow truck' },{ id: 23, descrition: 'hatchback' },{ id: 24, descrition: 'saloon' },{ id: 25, descrition: 'sport sedan' },{ id: 26, descrition: 'minibus' }], 
    vehicleColor = [{id:0,descrition:'other color'},{id:1,descrition:'white'},{id:2,descrition:'silver'},{id:3,descrition:'grey'},{id:4,descrition:'black'},{id:5,descrition:'red'},{id:6,descrition:'dark-blue'},{id:7,descrition:'blue'},{id:8,descrition:'yellow'},{id:9,descrition:'green'},{id:10,descrition:'brown'},{id:11,descrition:'pink'},{id:12,descrition:'purple'}]
    const now = moment().utcOffset('+0700').format('YYYY-MM-DDTHH:mm:00Z')
    let start = moment(now).subtract(5, 'minutes').utcOffset('+0700').format()
    let end = moment(now).utcOffset('+0700').format()
    let body_request_anpr = {
      cameraIndexCode: '2',
      pageNo: 1,
      pageSize: 1,
      startTime: start,
      endTime: end,
    }
    let body_request_faceMatchRecord = {
      pageNo: 1,
      pageSize: 1,
      startTime: start,
      endTime: end,
    }
    let data_anpr = await this.CrossRecords(body_request_anpr)
    let data_faceMatchRecord = await this.FaceMatchRecord(body_request_faceMatchRecord)
    if (data_anpr.response.data.total > 0) {
      let data_result_anpr = data_anpr.response.data.list
      for (const [i, x] of data_result_anpr.entries()) {
        // save picture to minio
        const data_request = { picUri: x.vehiclePicUri }
        var result_image = await this.vehicleImage(data_request)
        var file_image = b64.base64ToFile(result_image.response)
        await minio.putObject(
          'enygma',
          moment().format("YYYY-MM-DD")+'/'+file_image.name,
          file_image.file,
          file_image.size,
          file_image.type
        )
        data_result_anpr[i].filename = file_image.name
        data_result_anpr[i].vehicleColor_text = (vehicleColor.find(v=>v.id == x['vehicleColor ']))?.descrition
        data_result_anpr[i].vehicleType_text = (vehicleType.find(v=>v.id == x['vehicleType ']))?.descrition
      }
      data_result_anpr = data_result_anpr.map((x) => {
        return {
          type: 'anpr',
          detail: x,
        }
      })
      await mongodb.InsertMany(data_result_anpr)
    }
    if (data_faceMatchRecord.response.data.totalNum > 0) {
      let data_result_face_recognition = data_faceMatchRecord.response.data.list
      for (const [i, x] of data_result_face_recognition.entries()) {
        // save picture to minio
        const data_request = { picUri: x.bkgPicUrl }
        var result_image = await this.faceRecognitionImage(data_request)
        var file_image = b64.base64ToFile(result_image.response)
        await minio.putObject(
            'enygma',
            moment().format("YYYY-MM-DD")+'/'+file_image.name,
          file_image.file,
          file_image.size,
          file_image?.type
        )
        data_result_face_recognition[i].filename = file_image.name
      }
      data_result_face_recognition = data_result_face_recognition.map((x) => {
        x.filename = file_image.name
        return {
          type: 'face_recognition',
          detail: x,
        }
      })
      await mongodb.InsertMany(data_result_face_recognition)
    }
  }

  public async CrossRecords(body_request) {
    try {
      let path = '/api/pms/v1/crossRecords/page',
        method = 'POST'
      return await this.OpenApiArtemis(method, path, body_request)
    } catch (error) {
      throw new Error('Artemis crossRecords: ' + error.message)
    }
  }

  public async FaceMatchRecord(body_request) {
    try {
      let path = '/api/aiapplication/v1/face/faceMatchRecord',
        method = 'POST'
      return await this.OpenApiArtemis(method, path, body_request)
    } catch (error) {
      throw new Error('Artemis crossRecords: ' + error.message)
    }
  }

  public async vehicleImage(body_request) {
    try {
      let path = '/api/pms/v1/image',
        method = 'POST'
      return await this.OpenApiArtemis(method, path, body_request)
    } catch (error) {
      throw new Error('Artemis crossRecords: ' + error.message)
    }
  }

  public async faceRecognitionImage(body_request) {
    try {
      let path = '/api/eventService/v1/image_data',
        method = 'POST'
      return await this.OpenApiArtemis(method, path, body_request)
    } catch (error) {
      throw new Error('Artemis crossRecords: ' + error.message)
    }
  }

  private async OpenApiArtemis(method: string, path: string, data: object) {
    try {
      let options = {
        httpMethod: method,
        path: path,
        headers: {},
        query: {},
        parameter: {},
        body: data,
        contentType: 'application/json;charset=UTF-8',
        mock: false,
        appKey: '21477259',
        appSecret: 'ldBw3m2z9HP4xcFfMdYo',
      }
      return await fetch_request.httpsPost(
        artemis_hostname,
        artemis_debug_path,
        options,
        artemis_ssl
      )
    } catch (error) {
      throw new Error('Artemis OPEN API: ' + error.message)
    }
  }

  public async Delete7Day () {
    let sevenDayBefore = moment().subtract('days',7).format("YYYY-MM-DD")
    let query_delete = {created_at:{$lte:sevenDayBefore,type:'anpr'}}
    await mongodb.DeleteMany(query_delete)
  }
}

export default new Artemis()
