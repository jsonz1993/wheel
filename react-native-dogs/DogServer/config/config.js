/**
 * Created by Jsonz on 2017/6/10.
 */

const cloudinary = {
  cloud_name: 'jsonz',
  api_key: '628857244987282',
  api_secret: 'FcSGEEvMvMdHXh6x7Vu0K_jCp0U',
  base: 'http://res.cloudinary.com/jsonz',
  image: 'https://api.cloudinary.com/v1_1/jsonz/image/upload',
  video: 'https://api.cloudinary.com/v1_1/jsonz/video/upload',
  audio: 'https://api.cloudinary.com/v1_1/jsonz/raw/upload'
};

const qiniu = {
  AK: '-PXwInTDfzapA1ePGWvmWhPrB75bOaTvGzs-H-zv',
  SK: 'xMPNwhbRHhVuAc0uzdW4Az78TIfI0DlqohtbCAUl',
  video: 'os30wag1t.bkt.clouddn.com',
}

const rap = {
  base: 'http://rapapi.org/mockjs/19758/api/',
  comment: 'comment'
}

module.exports = {
  cloudinary,
  qiniu,
  rap,
  notify: ''
}