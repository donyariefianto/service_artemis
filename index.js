const https = require("https")
const axios = require('axios')
const { CronJob } = require('cron')
const replacing_time = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr)
var hostname_artemis = "localhost", path_artemis="/artemis-web/debug/", ssl=false, hostname_data = "https://s.enygma.id/artemis/"
var gmt_here = "+07:00"
var client_name = "ciliwung"

class base64 {
  isBase64(str) {
    str = str.split(',')[1]
    let base64Matcher = new RegExp(
      '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$'
    )
    return base64Matcher.test(str)
  }

  base64Size(str) {
    return str.length * (3 / 4)
  }

  base64CheckType(str) {
    var result =
      str.split(';')[0].includes('application/json') ||
      str.split(';')[0].includes('image') ||
      str.split(';')[0].includes('application/pdf') ||
      str.split(';')[0].includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return result
    // return str.split(";")[0].includes("image")
  }

  base64getType(str) {
    const result =
      str.split(';')[0].split('/')[1] == 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ? 'xlsx'
        : str.split(';')[0].split('/')[1]
    return result
    // return str.split(";")[0].split("/")[1]
  }
  base64ToFile(str) {
    if (this.base64CheckType(str)) {
      if (str.split(';')[0].includes('image')) {
        var fileName = Date.now() + '.' + this.base64getType(str)
      } else {
        var fileName = Date.now() + '.' + this.base64getType(str)
      }
      return {
        name: fileName,
        type: this.base64getType(str),
        size: this.base64Size(str),
        file: new Buffer.from(str.split(',')[1], 'base64'),
        file_blob: new File([
          new Blob([
            new Buffer.from(str.split(',')[1], 'base64')
          ],{ type: "application/octet-stream" })
        ],fileName,{ type: "application/octet-stream" })
      }
    }
  }
}

class Utilities {
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
  async OpenApiArtemis(method, path, data) {
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
      return await this.httpsPost(
        hostname_artemis,
        path_artemis,
        options,
        ssl
      )
    } catch (error) {
      throw new Error('Artemis OPEN API: ' + error.message)
    }
  }
  async GetCrossRecord (body_request) {
    try {
      let path = '/api/pms/v1/crossRecords/page',
        method = 'POST'
      return await this.OpenApiArtemis(method, path, body_request)
    } catch (error) {
      throw new Error('Artemis crossRecords: ' + error.message)
    }
  }
  async ProcessCrossRecords (start,end) {
    var body_request_crossrecord = {
      cameraIndexCode: '2',
      pageNo: 1,
      pageSize: 500,
      startTime: start,
      endTime: end,
    }
    return await this.GetCrossRecord(body_request_crossrecord)
  }
  async vehicleImage(body_request) {
    try {
      let path = '/api/pms/v1/image',
        method = 'POST'
      return await this.OpenApiArtemis(method, path, body_request)
    } catch (error) {
      throw new Error('Artemis crossRecords: ' + error.message)
    }
  }
  async PostImageMinio(file_data){
    try {
      var data = new FormData();
      data.append("list_data", "data");
      data.append("data", file_data.file_blob )
      const requestOptions = {
        url:hostname_data+"post_picture",
        method: "POST",
        headers: {},
        data: data
      };
      return await axios.request(requestOptions)
    } catch (error) {     
      return error.message
    }
  }
  async PostDataMongoDB(data_array){
    try {
      const requestOptions = {
        url:hostname_data+"post_data",
        method: "POST",
        headers: {},
        data: {
          data_result_anpr:data_array
        }
      };
      return await axios.request(requestOptions)
    } catch (error) {     
      return error.message
    }
  }
  formatingDate (dt) {
    var date = new Date(dt)
    return {
      year:date.getFullYear(),
      month:replacing_time(date.getMonth()+1),
      date:date.getDate(),
      hours:replacing_time(date.getHours()),
      minutes:replacing_time(date.getMinutes()),
      seconds:replacing_time(date.getSeconds()),
      format_tz:`${date.getFullYear()}-${replacing_time(date.getMonth()+1)}-${date.getDate()}T${replacing_time(date.getHours())}:${replacing_time(date.getMinutes())}:00${gmt_here}`
    }
  }
}

Runner()

async function Runner () {
  console.log("Program is Runnning...");
  const utility =  new Utilities()
  const b64 = new base64()
  

  let vehicleType = [{ id: 0, descrition: 'others' },{ id: 1, descrition: 'passenger vehicle' },{ id: 2, descrition: 'truck' },{ id: 3, descrition: 'sedan' },{ id: 4, descrition: 'minivan' },{ id: 5, descrition: 'light truck' },{ id: 6, descrition: 'pedestrian' },{ id: 7, descrition: 'two wheeler' },{ id: 8, descrition: 'tricycle' },{ id: 9, descrition: 'suv/mpv' },{ id: 10, descrition: 'middle-sized bus' },{ id: 11, descrition: 'motor vehicle' },{ id: 12, descrition: 'non motor vehicle' },{ id: 13, descrition: 'small sedan' },{ id: 14, descrition: 'mini sedan' },{ id: 15, descrition: 'pickup truck' },{ id: 16, descrition: 'container truck' },{ id: 17, descrition: 'minitruck and dropside trailer' },{ id: 18, descrition: 'dump truck' },{ id: 19, descrition: 'crane and engineering vehicle' },{ id: 20, descrition: 'oil tank truck' },{ id: 21, descrition: 'concrete mixer' },{ id: 22, descrition: 'flatbed tow truck' },{ id: 23, descrition: 'hatchback' },{ id: 24, descrition: 'saloon' },{ id: 25, descrition: 'sport sedan' },{ id: 26, descrition: 'minibus' }], 
  vehicleColor = [{id:0,descrition:'other color'},{id:1,descrition:'white'},{id:2,descrition:'silver'},{id:3,descrition:'grey'},{id:4,descrition:'black'},{id:5,descrition:'red'},{id:6,descrition:'dark-blue'},{id:7,descrition:'blue'},{id:8,descrition:'yellow'},{id:9,descrition:'green'},{id:10,descrition:'brown'},{id:11,descrition:'pink'},{id:12,descrition:'purple'}]
  
  const job = new CronJob('0,5,10,15,20,25,30,35,40,45,50,55 * * * *', async () => {
    let nows = new Date(Date.now())
    let now = utility.formatingDate(nows)
    let fiveminsbefore = utility.formatingDate(new Date(nows - 5 * 60000))
    console.log("schedulle Running ");
    console.log('start : '+fiveminsbefore.format_tz)
    console.log('end : '+now.format_tz)    
    let data_cross_record = await utility.ProcessCrossRecords(fiveminsbefore.format_tz,now.format_tz)
    if (data_cross_record.response.data.total>0) {
      let data_result_anpr = data_cross_record.response.data.list
      for (const [i, x] of data_result_anpr.entries()) {
        // save picture to minio
        const data_request = { picUri: x.vehiclePicUri }
        var result_image = await utility.vehicleImage(data_request)
        var file_image = b64.base64ToFile(result_image.response)
        await utility.PostImageMinio(file_image)
        data_result_anpr[i].filename = file_image.name
        data_result_anpr[i].vehicleColor_text = (vehicleColor.find(v=>v.id == x['vehicleColor ']))?.descrition
        data_result_anpr[i].vehicleType_text = (vehicleType.find(v=>v.id == x['vehicleType ']))?.descrition
      }
      data_result_anpr = data_result_anpr.map((x) => {
        return {
          type: 'anpr',
          client:client_name,
          detail: x,
          created_at:utility.formatingDate(new Date(Date.now())).format_tz
        }
      })
      await utility.PostDataMongoDB(data_result_anpr)      
    }
  })
  job.start()
}