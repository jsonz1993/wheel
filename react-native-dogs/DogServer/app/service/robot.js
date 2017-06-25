/**
 * Created by Jsonz on 2017/6/10.
 */

const qiniu = require('qiniu')
const config = require('../../config/config')
const uuid = require('uuid');
const cloudinary = require('cloudinary')
const Promise = require('bluebird')
let options = {
  persistentNotifyUrl: config.notify
}
let putPolicy;

qiniu.conf.ACCESS_KEY = config.qiniu.AK
qiniu.conf.SECRET_KEY = config.qiniu.SK
cloudinary.config(config.cloudinary)

//要上传的空间
bucket = 'jsonz-app';

exports.getQiniuToken = function (body) {
  //生成上传 Token
  let { type, } = body,
    key = uuid.v4();
  if (type === 'avatar') {
    key += '.jpeg';
    putPolicy = new qiniu.rs.PutPolicy("jsonz-app:"+key);
  } else if (key === 'video') {
    key += '.mp4'
    options.scope = 'jsonz-video:' + key;
    options.persistentOps = 'avthumb/mp4/an/1';
    putPolicy = new qiniu.rs.PutPolicy2(options)
  } else if (type === 'audio') {
    key += '.'
  }

  let token = putPolicy.token();
  return {
    token,
    key
  }
}

exports.uploadoCloudinary = function (url) {
  return new Promise((resolve, reject)=> {
    cloudinary.uploader.upload(url, function (result) {
      if (result && result.public_id) {
        resolve(result)
      } else {
        reject(result)
      }

    }, {
      resource_type: 'video',
      folder: 'video'
    })
  })
}