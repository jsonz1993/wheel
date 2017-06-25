/**
 * Created by Jsonz on 2017/6/7.
 */

let https = require('https')
let querystring = require('querystring')
let Promise = require('bluebird')
let speakeasy = require('speakeasy')

exports.getCode= function () {
  return speakeasy.totp({
    secret: 'Jsonz',
    digits: 4,
  });
}

exports.send = function (phoneNumber, msg) {
  return new Promise((res, rej)=> {
    if (!phoneNumber) return rej(new Error('手机号为空了'))

    let postData = {
      mobile: phoneNumber,
      message: msg + ' 【Jsonz-RN】'
    }

    let content = querystring.stringify(postData)

    let options = {
      host:'sms-api.luosimao.com',
      path:'/v1/send.json',
      method:'POST',
      auth:'api:key-030379383823507beb8383a2cecbda4f',
      agent:false,
      rejectUnauthorized : false,
      headers:{
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length' :content.length
      }
    }

    let str = ''
    let req = https.request(options,_res=>{

      if (_res.statusCode === 404) {
        return rej(new Error('短信服务器没有响应'));
      }

      _res.setEncoding('utf8')
      _res.on('data', function (chunk) {
        str += chunk
      })
      _res.on('end',()=> {
        let data
        try {
          data = JSON.parse(str)
        } catch(e) { rej(e) }

        if (data.error === 0) {
          res(data)
        } else {
          rej(new Error(data.error))
        }
      })
    })

    req.write(content)
    req.end()
  })
}

