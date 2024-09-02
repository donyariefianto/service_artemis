import * as fs from 'fs'
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
        var fileName = 'epoch_' + Date.now() + '.' + this.base64getType(str)
      }
      return {
        name: fileName,
        type: this.base64getType(str),
        size: this.base64Size(str),
        file: new Buffer.from(str.split(',')[1], 'base64'),
      }
    }
  }
}

export default new base64()
