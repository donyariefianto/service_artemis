// import type { HttpContext } from '@adonisjs/core/http'
import artemis from '#helpers/artemis'
import mongodb from '#helpers/mongodb'
import MinIO from '#helpers/minio'
import moment from 'moment'
import * as fs from 'fs'
import env from '#start/env'
const bucket_minio = env.get("MINIO_BUCKET")
import {createProxyMiddleware} from 'http-proxy-middleware'

export default class MainsController {
  async crossrecord({ request, response }) {
    try {
      let body = request.all()
      // await artemis.SaveANPR_FaceRM()
      // await mongodb.FindRaw({})
      //   let data = await artemis.faceRecognitionImage({
      //     picUri:'Vsm://PHQG#20240805#20240805_151314056.d:102909692:289516'
      //   })
        return response.status(200).send('data')
    } catch (error) {
      return response.status(500).send(error.message)
    }
  }
  async picture_fr({ request, response }) {
    try {
      let body = request.all()
      let data = await artemis.faceRecognitionImage({
        picUri: 'Vsm://PHQG#20240805#20240805_151314056.d:102909692:289516',
      })
      //   let data = await artemis.faceRecognitionImage({
      //     picUri:'Vsm://PHQG#20240805#20240805_151314056.d:102909692:289516'
      //   })
      return response.status(200).send(data.response)
    } catch (error) {
      return response.status(500).send(error.message)
    }
  }
  async getBucket({ response }) {
    return response.json()
  }
  async save_file_minio({ request, response }) {
    let { list_name, list_data } = request.all()
    try {
      if (!list_data) {
        return response.status(400).send({ messages: 'Invalid request list_data' })
      }
      for (const [index, data] of list_data.split(',').entries()) {
        var fileUpload = request.file(data)
        var file = fs.readFileSync(fileUpload.tmpPath)
        await MinIO.putObject(
          bucket_minio,
          moment().format("YYYY-MM-DD")+'/'+fileUpload.clientName,
          file,
          fileUpload.size,
          fileUpload.extname
        )
        fs.unlinkSync(fileUpload.tmpPath)
      }
      return response.status(200).send({status:"succes"})
    } catch (error) {
      return response.status(500).send({ messages: error.message })
    }
  }
  async save_data_anpr ({ request, response }) {
    try {
      let {data_result_anpr} = request.body()
      if (!data_result_anpr) {
        return response.status(400).send("Invalid request parameter data_result_anpr")
      }
      let res = await mongodb.InsertMany(data_result_anpr)
      return response.status(200).send(res)
    } catch (error) {
      return response.status(500).send(error.message)
    }
  }
  async update_data_anpr ({ request, response }) {
    try {
      let {id,query} = request.body()
      if (!id) {
        return response.status(400).send("Invalid request parameter id")
      }
      if (!query) {
        return response.status(400).send("Invalid request parameter query")
      }
      let res = await mongodb.UpdateOne(id,query)
      return response.status(200).send(res)
    } catch (error) {
      return response.status(500).send(error.message)
    }
  }
  async get_image ({request,response}) {
    let {filename,date} = request.all()
    if (!filename) {
      return response.status(400).send("Invalid request parameter")
    }
    if (!date) {
      return response.status(400).send("Invalid request parameter")
    }
    let res = await MinIO.getObjectFile(filename,date)
    response.safeHeader('Content-disposition', 'attachment; filename=' + filename );
    response.safeHeader('Content-type', 'binary/octet-stream')
    return response.status(200).send(res)
  }
  async get_data_mongo({ request, response }) {
    try {
      let {page_no,page_size,sort,type,client,custom,start,end} = request.all()
      if (!start) {
        start = moment().utcOffset('+0700').format("YYYY-MM-DDT00:00:00+07:00")
      }
      if (!end) {
        end = moment().utcOffset('+0700').format("YYYY-MM-DDT23:59:59+07:00")
      }
      if (!type) {
        return response.status(500).send("Invalid request parameter")
      }
      if (!client) {
        return response.status(500).send("Invalid request parameter")
      }
      if (!sort) {
        sort = {"created_at":-1}
      }
      let query = {type,client}
      if (type!="devices") {
        query["detail.crossTime"] = {
          $gte: start,
          $lte: end,
        }
      }
      let page = !page_no ? 1 : Number(page_no)
      let paging = !page_size ? 10 : Number(page_size)
      let skip = 0
      if(page == undefined){ page = 1 ,skip = 0}else{skip = (page-1)*paging }
      if (custom) {
        for (const i of Object.keys(JSON.parse(custom))) {
          query[`detail.${i}`] = JSON.parse(custom)[i]
        }
      }
      let data_length = await mongodb.GetLength(query)
      let data = await mongodb.FindWithPaging(query, skip, paging, sort)
      return response.status(200).send({
        status : 200, 
        message:'success', 
        timestamp:moment().unix(),
        total_data: data_length,
        page_size: Number(page_size),
        total_pages:Math.ceil(data_length/page_size),
        page_no:Number(page_no),
        data,
      })
    } catch (error) {
      return response.status(500).send(error.message)
    }
  }
  async get_data_mongo_aggregation ({ request, response }) {
    let {start,end,by_vehicle_type,by_hour,by_plate,custom} = request.all()
    if (!start) {
      start = moment().utcOffset('+0700').format("YYYY-MM-DDT00:00:00+07:00")
    }
    if (!end) {
      end = moment().utcOffset('+0700').format("YYYY-MM-DDT23:59:59+07:00")
    }
    var agg = []
    if (by_vehicle_type) {
      if (!start) {
        return response.status(500).send("Invalid request parameter start")
      }
      if (!end) {
        return response.status(500).send("Invalid request parameter end")
      }
      agg = [
        {
          $match: {
            "detail.crossTime": {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $group: {
            _id: "$detail.vehicleType_text",
            total: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            total: -1,
          },
        },
      ]
      if (custom) {
        for (const i of Object.keys(JSON.parse(custom))) {
          agg[0]['$match'][`detail.${i}`]=JSON.parse(custom)[i]
        }
      }
    }
    if (by_hour) {
      agg = [
        {
          $match: {
            "detail.crossTime": {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $group: {
            _id: { 
              $substr:
                ['$detail.crossTime',0,13]
            },
            total: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        }
      ]
      if (custom) {
        for (const i of Object.keys(JSON.parse(custom))) {
          agg[0]['$match'][`detail.${i}`]=JSON.parse(custom)[i]
        }
      }
    }
    if (by_plate) {
      agg = [
        {
          $match: {
            "detail.crossTime": {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $group: {
            _id: "null",
            total: {
              $sum: 1,
            },
            unknown: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$detail.plateNo", "Unknown"],
                  },
                  1,
                  0,
                ],
              },
            },
            known: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$detail.plateNo", "Unknown"],
                  },
                  0,
                  1,
                ],
              },
            },
          },
        },
      ]
      if (custom) {
        for (const i of Object.keys(JSON.parse(custom))) {
          agg[0]['$match'][`detail.${i}`]=JSON.parse(custom)[i]
        }
      }
    }
    
    let data = await mongodb.AggregationsRaw(agg)
    return response.status(200).send({status : 200, message:'success', timestamp:moment().unix(),data})
  }

}
